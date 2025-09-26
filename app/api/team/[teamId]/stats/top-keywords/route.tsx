import { auth } from "@/auth";
import { getPrismaClient } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { teamId: string } }) {
  const teamId = params.teamId;

  const prisma = getPrismaClient();
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const data = await prisma.feedbackTag.findMany({
    where: {
      teamId: teamId,
    },
    orderBy: {
      total: "desc",
    },
    take: 20,
  });

  const keywords = data.map((o) => ({ value: o.name, count: o.total }));

  return NextResponse.json({ success: true, message: "Success to get team", data: keywords });
}
