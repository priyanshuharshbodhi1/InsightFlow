import { auth } from "@/auth";
import { getPrismaClient } from "@/lib/database";
import { NextResponse } from "next/server";
import { getChatModel } from "@/lib/ai-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const prisma = getPrismaClient();
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

  let data;
  if (searchParams.get("sentiment") === "all") {
    data = await prisma.feedback.findMany({
      select: {
        description: true,
      },
      where: {
        teamId: searchParams.get("teamId")!,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 40,
    });
  } else {
    data = await prisma.feedback.findMany({
      select: {
        description: true,
      },
      where: {
        teamId: searchParams.get("teamId")!,
        sentiment: searchParams.get("sentiment"),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 40,
    });
  }

  const feedbacks = data.map((i) => "- " + i.description);

  const model = getChatModel(0.5);
  const res = await model.invoke(`The following is a list of feedback from customers for my business. Help me to create a summary in one to two sentences. And then give the conclusion of the summary:${feedbacks.join("\n")}`);

  return NextResponse.json({ success: true, message: "Success to summarized data", data: res.content });
  } catch (error) {
    console.error("Summary API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred while generating summary";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
