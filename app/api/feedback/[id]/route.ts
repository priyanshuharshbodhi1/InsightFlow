import { auth } from "@/auth";
import { getPrismaClient } from "@/lib/database";
import { NextResponse } from "next/server";
import { getEmbeddingsModel } from "@/lib/ai-service";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    const prisma = getPrismaClient();
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

  const feedback = await prisma.feedback.findUnique({
    where: {
      id: id,
    },
  });

  const embeddings = getEmbeddingsModel();
  const vectorData = await embeddings.embedDocuments([feedback?.description!]);

  const relateds = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id, content, metadata, vec_cosine_distance(embedding, '[${vectorData}]') AS distance FROM EmbeddedDocument ORDER BY distance LIMIT 6`
  );

  return NextResponse.json({ success: true, message: "Success to get feedback", data: {...feedback, relateds} }, { status: 200 });
  } catch (error) {
    console.error("Feedback Detail API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred while fetching feedback details";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
