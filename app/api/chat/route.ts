import { getPrismaClient } from "@/lib/database";
import { elasticsearchGeminiService } from "@/lib/elasticsearch-simple";
import { streamText, convertToCoreMessages } from "ai";
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

    // Use Elasticsearch hybrid search to find relevant feedback documents
    console.log("🔍 Chat API: Searching for relevant feedback...");
    const relateds = await elasticsearchGeminiService.hybridSearch(
      currentMessageContent,
      vectorData[0], // First (and only) embedding
      team?.id, // Filter by team if provided
      40 // Limit results
    );
    console.log("✅ Chat API: Found", relateds.length, "relevant documents");
    
    const context = relateds.map((doc: any) => doc.content).join("\n- ");

    console.log("🤖 Chat API: Starting streaming response...");
    const result = await streamText({
      model: getStreamingChatModel() as any,
      messages: convertToCoreMessages(messages),
      system: `You are a smart assistant who helps users analyze feedback for their company. Here is the user profile: \n- Name: ${session?.user?.name}\n\n
    Here is the feedback list the company has received:
    ${context}

    Rules:
    - Format the results in markdown
    - If you don't know the answer, just say you don't know. Don't try to make up an answer
    - Answer concisely & in detail
    - Current AI Provider: ${getCurrentAIProvider()}`,
    });
    console.log("✅ Chat API: Streaming response initiated");

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: error instanceof Error ? error.message : "An error occurred while processing your request" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
