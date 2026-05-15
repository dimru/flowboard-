import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const projects = await prisma.project.findMany({
    where: {
      members: { some: { userId } },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
      columns: {
        include: {
          tasks: { select: { id: true } },
        },
      },
      owner: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const formatted = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    color: p.color,
    icon: p.icon,
    owner: p.owner,
    memberCount: p.members.length,
    members: p.members.map((m) => ({
      ...m.user,
      role: m.role,
    })),
    taskCount: p.columns.reduce((sum, col) => sum + col.tasks.length, 0),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  return NextResponse.json(formatted);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { name, description, color, icon } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      name,
      description: description || "",
      color: color || "#6366f1",
      icon: icon || "📋",
      ownerId: userId,
      members: {
        create: { userId, role: "OWNER" },
      },
      columns: {
        create: [
          { name: "To Do", position: 0, color: "#94a3b8" },
          { name: "In Progress", position: 1, color: "#f59e0b" },
          { name: "Done", position: 2, color: "#10b981" },
        ],
      },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
      columns: true,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
