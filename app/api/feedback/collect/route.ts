import { getPrismaClient } from "@/lib/database";
import { elasticsearchGeminiService } from "@/lib/elasticsearch-simple";
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

    // Generate embeddings and store in Elasticsearch
    const texts = [`${body.text}`];
    const embeddings = getEmbeddingsModel();
    const vectorData = await embeddings.embedDocuments(texts);

    // Store document with embeddings in Elasticsearch
    await elasticsearchGeminiService.indexDocument({
      id: `feedback_${feedbackStored.id}`,
      teamId: body.teamId,
      content: texts[0],
      embedding: vectorData[0],
      metadata: { 
        type: "feedback", 
        sentiment: (textClassify.content as String).trim(), 
        feedbackId: feedbackStored.id, 
        teamId: body.teamId 
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true, message: "Success send feedback", data: feedbackStored }, { status: 200 });
  } catch (error) {
    console.error("Feedback Collection Error:", error);
    
    // Provide specific error messages for common issues
    let errorMessage = "An error occurred while processing feedback";
    if (error instanceof Error) {
      if (error.message.includes("GEMINI_API_KEY")) {
        errorMessage = "Gemini API key is missing. Please add GEMINI_API_KEY to your .env file.";
      } else if (error.message.includes("Elasticsearch")) {
        errorMessage = "Elasticsearch connection failed. Please check your Elasticsearch configuration.";
      } else if (error.message.includes("embedding")) {
        errorMessage = "Failed to generate embeddings. Please check your Gemini API key and internet connection.";
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json({ success: false, message: errorMessage, error: error instanceof Error ? error.stack : error }, { status: 500 });
  }
}
