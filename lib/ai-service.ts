import { google } from "@ai-sdk/google"; 
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// Gemini-only AI service for hackathon
export function getAvailableAIService() {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  
  if (hasGemini) {
    return { provider: 'gemini', available: true };
  } else {
    throw new Error('GEMINI_API_KEY is required for this hackathon project');
  }
}

// Get streaming chat model for AI SDK
export function getStreamingChatModel() {
  const service = getAvailableAIService();
  
  if (service.provider === 'gemini') {
    // Ensure API key is available
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is missing. Please add it to your .env file.');
    }
    
    // Set the environment variable that AI SDK expects
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;
    
    console.log("🔑 Using Gemini API Key for streaming chat");
    return google("gemini-2.5-flash-lite");
  } else {
    throw new Error('Only Gemini is supported in this hackathon version');
  }
}

// Get streaming model info for debugging
export function getStreamingModelInfo() {
  const service = getAvailableAIService();
  
  if (service.provider === 'gemini') {
    return { provider: 'gemini', model: 'gemini-2.5-flash-lite' };
  } else {
    return { provider: 'none', model: null };
  }
}

// Get chat model for LangChain
export function getChatModel(temperature: number = 0.5) {
  const service = getAvailableAIService();
  
  if (service.provider === 'gemini') {
    return new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash-lite", // Use latest model
      temperature,
      apiKey: process.env.GEMINI_API_KEY,
    });
  } else {
    throw new Error('Only Gemini is supported in this hackathon version');
  }
}

// Get embeddings model - Gemini only
export function getEmbeddingsModel() {
  const service = getAvailableAIService();
  
  if (service.provider === 'gemini') {
    try {
      console.log("✅ Using Gemini text-embedding-004 model (768 dimensions)");
      return new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004", // Latest Gemini embedding model
        apiKey: process.env.GEMINI_API_KEY,
      });
    } catch (error) {
      console.error("❌ Error loading Gemini embeddings:", error);
      throw new Error('Failed to load Gemini embeddings. Make sure @langchain/google-genai is installed and GEMINI_API_KEY is set.');
    }
  } else {
    throw new Error('GEMINI_API_KEY is required for embeddings');
  }
}

// Get embedding dimensions - Always 768 for Gemini
export function getEmbeddingDimensions() {
  return 768; // Gemini text-embedding-004 uses 768 dimensions
}

// Get the current AI provider for logging/debugging
export function getCurrentAIProvider() {
  return getAvailableAIService().provider;
}
