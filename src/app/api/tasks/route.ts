import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { title, description, priority, columnId, assigneeId, dueDate } = await req.json();

  if (!title || !columnId) {
    return NextResponse.json(
      { error: "Title and columnId are required" },
      { status: 400 }
    );
  }

  const maxPos = await prisma.task.aggregate({
    where: { columnId },
    _max: { position: true },
  });

  const task = await prisma.task.create({
    data: {
      title,
      description: description || "",
      priority: priority || "MEDIUM",
      position: (maxPos._max.position ?? -1) + 1,
      columnId,
      assigneeId: assigneeId || null,
      createdById: userId,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: {
      assignee: { select: { id: true, name: true, avatar: true } },
      createdBy: { select: { id: true, name: true, avatar: true } },
      comments: true,
    },
  });

  // Notify assignee
  if (assigneeId && assigneeId !== userId) {
    await prisma.notification.create({
      data: {
        type: "TASK_ASSIGNED",
        message: `You were assigned to "${title}"`,
        userId: assigneeId,
        linkedTaskId: task.id,
      },
    });
  }

  return NextResponse.json(task, { status: 201 });
}
