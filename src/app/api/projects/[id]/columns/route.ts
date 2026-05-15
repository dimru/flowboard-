import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, color } = await req.json();

  const maxPos = await prisma.column.aggregate({
    where: { projectId: params.id },
    _max: { position: true },
  });

  const column = await prisma.column.create({
    data: {
      name: name || "New Column",
      position: (maxPos._max.position ?? -1) + 1,
      color: color || "#6366f1",
      projectId: params.id,
    },
    include: { tasks: true },
  });

  return NextResponse.json(column, { status: 201 });
}
