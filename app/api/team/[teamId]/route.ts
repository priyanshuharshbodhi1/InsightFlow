import { auth } from "@/auth";
import { getPrismaClient } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { teamId: string } }) {
  const teamId = params.teamId;

  const prisma = getPrismaClient();
  // const session = await auth();
  // if (!session) {
  //   return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  // }

  const team = await prisma.team.findUnique({
    where: {
      id: teamId,
    },
  });

  if (!team) {
    return NextResponse.json({ success: false, message: "Team not found" }, { status: 404 });
  }

  return NextResponse.json(
    { success: true, message: "Success to get team", data: team },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
