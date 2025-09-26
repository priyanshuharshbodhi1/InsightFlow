import { auth } from "@/auth";
import { getPrismaClient } from "@/lib/database";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const prisma = getPrismaClient();
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const team = await prisma.team.findUnique({
    where: {
      id: body.teamId,
    },
  });

  if (!team) {
    return NextResponse.json({ success: false, message: "Team not found" }, { status: 404 });
  }

  const updatedTeam = await prisma.team.update({
    where: {
      id: team.id,
    },
    data: {
      style: body.style,
    },
  });

  return NextResponse.json({ success: true, message: "Successfully updated", data: updatedTeam }, { status: 200 });
}
