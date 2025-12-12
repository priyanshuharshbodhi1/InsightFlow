import { getPrismaClient } from "@/lib/database";
// import { elasticsearchGeminiService } from "@/lib/elasticsearch-simple";
import { NextResponse } from "next/server";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { stopWords } from "@/lib/stop-words";
import { getChatModel, getEmbeddingsModel } from "@/lib/ai-service";

const TEXT_CLASIFY = `Classify the sentiment of the message
Input: I had a terrible experience with this store. The clothes were of poor quality and overpriced.
Output: negative

Input: The clothing selection is decent, but the customer service needs improvement. It was just an okay experience.
Output: neutral

Input: I absolutely love shopping here! The staff is so helpful, and I always find stylish and affordable clothes.
Output: positive

Input: {input}
Output:
`;

const AI_RESPONSE = `User given feedback for us, please provide a summary or suggestion how to address common issues raised to act for us as company. Format the results in markdown. Here is the feedback: {input}`;

export async function POST(req: Request) {
  const prisma = getPrismaClient();
  const body = await req.json();

  // Validate required environment variables
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ 
      success: false, 
      message: "Gemini API key is required. Please add GEMINI_API_KEY to your .env file." 
    }, { status: 500 });
  }

  // Validate required body parameters
  if (!body.text || !body.teamId) {
    return NextResponse.json({ 
      success: false, 
      message: "Missing required fields: text and teamId are required." 
    }, { status: 400 });
  }

  try {
    // Classify Text
    const promptClassify = ChatPromptTemplate.fromTemplate(TEXT_CLASIFY);
    const formattedPromptClassify = await promptClassify.format({
      input: body.text,
    });
    const modelClassify = getChatModel(0.2);
    const textClassify = await modelClassify.invoke(formattedPromptClassify);

    // aiResponse feedback
    const promptResponse = ChatPromptTemplate.fromTemplate(AI_RESPONSE);
    const formattedPromptResponse = await promptResponse.format({
      input: body.text,
    });
    const modelResponse = getChatModel(0.7);
    const textResponse = await modelResponse.invoke(formattedPromptResponse);

    const feedbackStored = await prisma.feedback.create({
      data: {
        teamId: body.teamId,
        rate: body.rate,
        description: body.text,
        aiResponse: (textResponse.content as String).trim(),
        sentiment: (textClassify.content as String).trim(),
      },
    });

    // Split Text
    const textSplitted = body.text
      .toLowerCase()
      .replace(/[.,?!]/g, "")
      .split(/\s+/);

    textSplitted.map(async (ts: string) => {
      const excludeWords = stopWords;
      if (!excludeWords.includes(ts.trim().toLowerCase())) {
        const wordTag = await prisma.feedbackTag.findFirst({
          where: {
            teamId: body.teamId,
            name: ts.trim(),
          },
        });

        if (wordTag) {
          await prisma.feedbackTag.update({
            where: {
              id: wordTag.id,
            },
            data: {
              total: wordTag.total + 1,
            },
          });
        } else {
          await prisma.feedbackTag.create({
            data: {
              teamId: body.teamId,
              name: ts.trim(),
              total: 1,
            },
          });
        }
      }
    });

    // Generate embeddings and store in TiDB vector column
    try {
      const texts = [`${body.text}`];
      const embeddings = getEmbeddingsModel();
      const vectorData = await embeddings.embedDocuments(texts);

      // Store document with embeddings in TiDB
      const embeddedDocument = await prisma.embeddedDocument.create({
        data: {
          teamId: body.teamId,
          content: texts[0],
          metadata: { 
            type: "feedback", 
            sentiment: (textClassify.content as String).trim(), 
            feedbackId: feedbackStored.id, 
            teamId: body.teamId 
          },
        },
      });

      // Update vector column with raw SQL (TiDB requirement for vector type)
      await prisma.$executeRawUnsafe(
        `UPDATE EmbeddedDocument SET embedding = '[${vectorData[0]}]' WHERE id = '${embeddedDocument.id}'`
      );
      
      console.log('✅ Feedback indexed in TiDB with vector successfully');
    } catch (tidbError) {
      // Log error but don't fail the request - TiDB vector storage is optional
      console.warn('⚠️ TiDB vector indexing failed (feedback still saved to database):', tidbError instanceof Error ? tidbError.message : tidbError);
    }

    return NextResponse.json({ success: true, message: "Success send feedback", data: feedbackStored }, { status: 200 });
  } catch (error: any) {
    console.error("Feedback Collection Error:", error);
    
    // Provide specific error messages for common issues
    let errorMessage = "An error occurred while processing feedback";
    
    if (error?.message) {
      const errorMsg = error.message;
      
      // Check for quota exceeded error
      if (errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
        errorMessage = "⚠️ API quota exceeded. The Gemini API free tier limit has been reached. Please try again tomorrow or upgrade your API plan.";
      }
      // Check for database connection errors
      else if (errorMsg.includes("Can't reach database") || errorMsg.includes("connection")) {
        errorMessage = "🗄️ Database connection error: Unable to connect to the database. Please check your DATABASE_URL configuration.";
      }
      // Check for Prisma-specific errors
      else if (errorMsg.includes("Prisma") || errorMsg.includes("PrismaClient")) {
        errorMessage = `🗄️ Database error: ${errorMsg}`;
      }
      // Check for TiDB/MySQL errors
      else if (errorMsg.includes("TiDB") || errorMsg.includes("MySQL") || errorMsg.includes("vector")) {
        errorMessage = `🗄️ Database query error: ${errorMsg}`;
      }
      // Check for API key errors
      else if (errorMsg.includes("GEMINI_API_KEY") || errorMsg.includes("API key")) {
        errorMessage = "🔑 Gemini API key is missing or invalid. Please check your .env file.";
      }
      // Check for embedding errors
      else if (errorMsg.includes("embedding") || errorMsg.includes("embed")) {
        errorMessage = "🧠 Failed to generate embeddings. Please check your Gemini API key and internet connection.";
      }
      // Elasticsearch errors (legacy)
      else if (errorMsg.includes("Elasticsearch")) {
        errorMessage = "Elasticsearch connection failed (deprecated feature).";
      }
      else {
        errorMessage = errorMsg;
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      message: errorMessage, 
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : error) : undefined 
    }, { status: 500 });
  }
}
