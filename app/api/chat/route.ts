import { getPrismaClient } from "@/lib/database";
// import { elasticsearchGeminiService } from "@/lib/elasticsearch-simple";
import { generateText, convertToCoreMessages } from "ai";
import { getStreamingChatModel, getEmbeddingsModel, getCurrentAIProvider } from "@/lib/ai-service";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const formatMessage = (message: any) => {
  return `${message.role}: ${message.content}`;
};

export async function POST(req: Request) {
  try {
    console.log("🔍 Chat API: Starting request processing...");
    
    // Check if required environment variables are set
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY is missing");
      throw new Error("GEMINI_API_KEY environment variable is missing. Please add it to your .env file.");
    }
    
    const { messages, team, session } = await req.json();
    console.log("📥 Chat API: Request data received", { teamId: team?.id, messageCount: messages?.length });
    
    // Test if we can get the streaming model without errors
    try {
      const testModel = getStreamingChatModel();
      console.log("✅ Chat model loaded successfully");
    } catch (modelError) {
      console.error("❌ Error loading chat model:", modelError);
      throw new Error(`Failed to load chat model: ${modelError instanceof Error ? modelError.message : 'Unknown error'}`);
    }
    
    const prisma = getPrismaClient();

    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;

    // Generate embeddings using current AI service
    console.log("🧠 Chat API: Generating embeddings...");
    const texts = [currentMessageContent];
    const embeddings = getEmbeddingsModel();
    const vectorData = await embeddings.embedDocuments(texts);
    console.log("✅ Chat API: Embeddings generated successfully");

    // Use TiDB vector cosine distance for semantic search
    console.log("🔍 Chat API: Searching for relevant feedback using TiDB vector search...");
    const searchMethod = "TiDB Vector Search";
    
    // Use TiDB's vec_cosine_distance for vector similarity search
    const teamFilter = team?.id ? `WHERE teamId = '${team.id}'` : '';
    const relateds = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, content, metadata, vec_cosine_distance(embedding, '[${vectorData[0]}]') AS distance 
       FROM EmbeddedDocument 
       ${teamFilter}
       ORDER BY distance 
       LIMIT 40`
    );
    
    console.log("✅ Chat API: Found", relateds.length, "relevant documents via TiDB vector search");
    
    const context = relateds.map((doc: any) => doc.content).join("\n- ");

    const result = await generateText({
      model: getStreamingChatModel() as any,
      messages: convertToCoreMessages(messages),
      system: `You are a smart assistant who helps users analyze feedback for their company. Here is the user profile: \n- Name: ${session?.user?.name}\n\n
    Here is the feedback list the company has received:
    ${context}

    Rules:
    - Format the results in markdown
    - If you don't know the answer, just say you don't know. Don't try to make up an answer
    - Answer concisely & in detail
    - Current AI Provider: ${getCurrentAIProvider()}
    - Search Method: ${searchMethod}`,
    });
    console.log("✅ Chat API: Response generated successfully");

    return new Response(JSON.stringify({ 
      role: 'assistant',
      content: result.text 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    
    // Extract user-friendly error message
    let userMessage = "An error occurred while processing your request";
    
    if (error?.message) {
      const errorMsg = error.message;
      
      // Check for quota exceeded error
      if (errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
        userMessage = "⚠️ API quota exceeded. The Gemini API free tier limit (20 requests/day) has been reached. Please try again tomorrow or upgrade your API plan.";
      }
      // Check for database errors
      else if (errorMsg.includes("Prisma") || errorMsg.includes("database") || errorMsg.includes("connection")) {
        userMessage = "🗄️ Database error: Unable to connect to the database. Please check your DATABASE_URL configuration.";
      }
      // Check for TiDB-specific errors
      else if (errorMsg.includes("TiDB") || errorMsg.includes("vector") || errorMsg.includes("MySQL")) {
        userMessage = `🗄️ Database query error: ${errorMsg}`;
      }
      // Check for embedding errors
      else if (errorMsg.includes("embedding") || errorMsg.includes("embed")) {
        userMessage = "🧠 Embedding generation failed. Please check your internet connection and API key.";
      }
      // Generic API errors
      else if (errorMsg.includes("API") || errorMsg.includes("network")) {
        userMessage = `API Error: ${errorMsg}`;
      } else {
        userMessage = errorMsg;
      }
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: userMessage
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
