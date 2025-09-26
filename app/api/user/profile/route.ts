import { auth } from "@/auth";
import { getPrismaClient } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const prisma = getPrismaClient();
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user!.email!,
    },
    include: {
      teams: {
        include: {
          team: true,
        },
      },
    },
  });

  return NextResponse.json({ success: true, message: "Successfully fetched user profile", data: user }, { status: 200 });
}
