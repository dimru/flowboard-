import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const comments = await prisma.comment.findMany({
    where: { taskId: params.id },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Comment content required" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      taskId: params.id,
      userId,
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  });

  // Notify task assignee and creator
  const task = await prisma.task.findUnique({
    where: { id: params.id },
    select: { title: true, assigneeId: true, createdById: true },
  });

  if (task) {
    const notifyUsers = new Set<string>();
    if (task.assigneeId && task.assigneeId !== userId) notifyUsers.add(task.assigneeId);
    if (task.createdById !== userId) notifyUsers.add(task.createdById);

    for (const uid of notifyUsers) {
      await prisma.notification.create({
        data: {
          type: "COMMENT",
          message: `${session.user.name} commented on "${task.title}"`,
          userId: uid,
          linkedTaskId: params.id,
        },
      });
    }
  }

  return NextResponse.json(comment, { status: 201 });
}
