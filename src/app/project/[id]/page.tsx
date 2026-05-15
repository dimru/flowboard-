"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import Navbar from "@/components/Navbar";
import TaskModal from "@/components/TaskModal";
import { useSocket } from "@/components/SocketProvider";

const avatarGradients = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #10b981, #06b6d4)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
];
function getAG(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return avatarGradients[Math.abs(h) % avatarGradients.length];
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = { HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#10b981" };
  return <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[priority] || "#6366f1", flexShrink: 0 }} />;
}

// ─── Task Card ─────────────────────────────────────────
function TaskCard({ task, onClick }: { task: any; onClick: () => void }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <motion.div
      layout
      layoutId={`task-${task.id}`}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.3), 0 0 20px rgba(99,102,241,0.08)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        padding: 16,
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        backdropFilter: "blur(10px)",
        position: "relative",
      }}
    >
      {/* Priority + Title */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
        <PriorityDot priority={task.priority} />
        <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, flex: 1 }}>{task.title}</span>
      </div>

      {/* Bottom row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {task.dueDate && (
            <span style={{
              fontSize: 11, padding: "2px 7px", borderRadius: "var(--radius-full)",
              background: isOverdue ? "rgba(239,68,68,0.15)" : "var(--surface)",
              color: isOverdue ? "#f87171" : "var(--text-muted)",
            }}>
              {new Date(task.dueDate).toLocaleDateString("en", { month: "short", day: "numeric" })}
            </span>
          )}
          {task.comments?.length > 0 && (
            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
              💬 {task.comments.length}
            </span>
          )}
        </div>
        {task.assignee && (
          <div className="avatar avatar-sm" style={{ background: getAG(task.assignee.name), color: "white", fontSize: 9 }}>
            {task.assignee.avatar || task.assignee.name?.[0]}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Add Task Inline ───────────────────────────────────
function AddTaskInline({ columnId, onAdd }: { columnId: string; onAdd: (task: any) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), columnId }),
      });
      const task = await res.json();
      onAdd(task);
      setTitle("");
      setOpen(false);
    } catch (e) {}
    setLoading(false);
  };

  if (!open) {
    return (
      <motion.button
        whileHover={{ background: "var(--surface-hover)" }}
        onClick={() => setOpen(true)}
        style={{
          width: "100%", padding: "10px 14px", background: "transparent",
          border: "1px dashed var(--glass-border)", borderRadius: "var(--radius-md)",
          color: "var(--text-muted)", cursor: "pointer", fontSize: 13,
          fontFamily: "inherit", textAlign: "left", transition: "all 150ms",
        }}
      >
        + Add task
      </motion.button>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      <input ref={inputRef} className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title..." style={{ fontSize: 13 }} />
      <div style={{ display: "flex", gap: 6 }}>
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading} style={{ flex: 1 }}>
          {loading ? "..." : "Add"}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setOpen(false); setTitle(""); }}>
          Cancel
        </button>
      </div>
    </motion.form>
  );
}

// ─── Column ────────────────────────────────────────────
function BoardColumn({ column, onTaskClick, onTaskAdd, onDrop, draggedTask, setDraggedTask }: any) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        width: 320, minWidth: 320, flexShrink: 0,
        display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 180px)",
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragOver(false); onDrop(column.id); }}
    >
      {/* Column Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "0 4px" }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: column.color }} />
        <span style={{ fontSize: 14, fontWeight: 700, flex: 1 }}>{column.name}</span>
        <span style={{
          fontSize: 12, fontWeight: 600, color: "var(--text-muted)",
          background: "var(--surface)", padding: "2px 8px", borderRadius: "var(--radius-full)",
        }}>
          {column.tasks?.length || 0}
        </span>
      </div>

      {/* Tasks */}
      <div style={{
        flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8,
        padding: 4,
        borderRadius: "var(--radius-lg)",
        border: isDragOver ? "2px dashed var(--accent)" : "2px dashed transparent",
        background: isDragOver ? "rgba(99,102,241,0.04)" : "transparent",
        transition: "all 200ms",
      }}>
        <AnimatePresence mode="popLayout">
          {(column.tasks || []).map((task: any) => (
            <div
              key={task.id}
              draggable
              onDragStart={() => setDraggedTask({ ...task, fromColumnId: column.id })}
              onDragEnd={() => setDraggedTask(null)}
            >
              <TaskCard task={task} onClick={() => onTaskClick(task)} />
            </div>
          ))}
        </AnimatePresence>

        <AddTaskInline columnId={column.id} onAdd={(task) => onTaskAdd(column.id, task)} />
      </div>
    </motion.div>
  );
}

// ─── Main Board Page ───────────────────────────────────
export default function ProjectBoardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { socket } = useSocket();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);

  // Zoom state
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Fetch project
  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      if (res.ok) setProject(data);
      else router.push("/dashboard");
    } catch (e) { router.push("/dashboard"); }
    setLoading(false);
  }, [projectId, router]);

  useEffect(() => { if (status === "authenticated") fetchProject(); }, [status, fetchProject]);

  // Socket real-time
  useEffect(() => {
    if (!socket || !project) return;
    const userId = (session?.user as any)?.id;
    socket.emit("join-project", { projectId, userId, userName: session?.user?.name });

    socket.on("task-created", ({ task }: any) => {
      setProject((prev: any) => {
        if (!prev) return prev;
        const cols = prev.columns.map((c: any) =>
          c.id === task.columnId ? { ...c, tasks: [...c.tasks, task] } : c
        );
        return { ...prev, columns: cols };
      });
    });

    socket.on("task-updated", ({ task }: any) => {
      setProject((prev: any) => {
        if (!prev) return prev;
        const cols = prev.columns.map((c: any) => ({
          ...c,
          tasks: c.tasks.map((t: any) => (t.id === task.id ? { ...t, ...task } : t)),
        }));
        return { ...prev, columns: cols };
      });
    });

    socket.on("task-deleted", ({ taskId }: any) => {
      setProject((prev: any) => {
        if (!prev) return prev;
        const cols = prev.columns.map((c: any) => ({
          ...c,
          tasks: c.tasks.filter((t: any) => t.id !== taskId),
        }));
        return { ...prev, columns: cols };
      });
    });

    socket.on("task-moved", ({ taskId, toColumnId, newPosition }: any) => {
      setProject((prev: any) => {
        if (!prev) return prev;
        let movedTask: any = null;
        let cols = prev.columns.map((c: any) => {
          const found = c.tasks.find((t: any) => t.id === taskId);
          if (found) movedTask = { ...found };
          return { ...c, tasks: c.tasks.filter((t: any) => t.id !== taskId) };
        });
        if (movedTask) {
          movedTask.columnId = toColumnId;
          cols = cols.map((c: any) =>
            c.id === toColumnId ? { ...c, tasks: [...c.tasks, movedTask] } : c
          );
        }
        return { ...prev, columns: cols };
      });
    });

    socket.on("comment-added", ({ taskId, comment }: any) => {
      setProject((prev: any) => {
        if (!prev) return prev;
        const cols = prev.columns.map((c: any) => ({
          ...c,
          tasks: c.tasks.map((t: any) =>
            t.id === taskId ? { ...t, comments: [...(t.comments || []), comment] } : t
          ),
        }));
        return { ...prev, columns: cols };
      });
      if (selectedTask?.id === taskId) {
        setSelectedTask((prev: any) => prev ? { ...prev, comments: [...(prev.comments || []), comment] } : prev);
      }
    });

    socket.on("presence-update", ({ users }: any) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.emit("leave-project", { projectId });
      socket.off("task-created");
      socket.off("task-updated");
      socket.off("task-deleted");
      socket.off("task-moved");
      socket.off("comment-added");
      socket.off("presence-update");
    };
  }, [socket, project?.id]);

  // Handle drop
  const handleDrop = async (toColumnId: string) => {
    if (!draggedTask || draggedTask.fromColumnId === toColumnId) return;
    const taskId = draggedTask.id;
    const fromColumnId = draggedTask.fromColumnId;

    // Optimistic update
    setProject((prev: any) => {
      if (!prev) return prev;
      let movedTask: any = null;
      let cols = prev.columns.map((c: any) => {
        const found = c.tasks.find((t: any) => t.id === taskId);
        if (found) movedTask = { ...found };
        return { ...c, tasks: c.tasks.filter((t: any) => t.id !== taskId) };
      });
      if (movedTask) {
        movedTask.columnId = toColumnId;
        cols = cols.map((c: any) =>
          c.id === toColumnId ? { ...c, tasks: [...c.tasks, movedTask] } : c
        );
      }
      return { ...prev, columns: cols };
    });

    // API call
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId: toColumnId, position: 999 }),
      });
      socket?.emit("task-moved", { projectId, taskId, fromColumnId, toColumnId, newPosition: 999 });
    } catch (e) {}
  };

  const handleTaskAdd = (columnId: string, task: any) => {
    setProject((prev: any) => {
      if (!prev) return prev;
      const cols = prev.columns.map((c: any) =>
        c.id === columnId ? { ...c, tasks: [...c.tasks, task] } : c
      );
      return { ...prev, columns: cols };
    });
    socket?.emit("task-created", { projectId, task });
  };

  const handleTaskUpdate = (updatedTask: any) => {
    setProject((prev: any) => {
      if (!prev) return prev;
      const cols = prev.columns.map((c: any) => ({
        ...c,
        tasks: c.tasks.map((t: any) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t)),
      }));
      return { ...prev, columns: cols };
    });
    setSelectedTask(updatedTask);
    socket?.emit("task-updated", { projectId, task: updatedTask });
  };

  const handleTaskDelete = (taskId: string) => {
    setProject((prev: any) => {
      if (!prev) return prev;
      const cols = prev.columns.map((c: any) => ({
        ...c,
        tasks: c.tasks.filter((t: any) => t.id !== taskId),
      }));
      return { ...prev, columns: cols };
    });
    socket?.emit("task-deleted", { projectId, taskId });
  };

  const handleAddColumn = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Column" }),
      });
      const col = await res.json();
      setProject((prev: any) => prev ? { ...prev, columns: [...prev.columns, col] } : prev);
    } catch (e) {}
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) setInviteMsg(data.error);
      else {
        setInviteMsg(`${data.user.name} added!`);
        setInviteEmail("");
        fetchProject();
      }
    } catch (e) { setInviteMsg("Failed to invite"); }
  };

  // Zoom with scroll wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      setZoom((z) => Math.max(0.5, Math.min(1.5, z - e.deltaY * 0.001)));
    }
  };

  const allMembers = project?.members?.map((m: any) => m.user) || [];

  if (loading || status !== "authenticated") {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  if (!project) return null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* Board Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          paddingTop: 80, padding: "80px 28px 0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <motion.button
            onClick={() => router.push("/dashboard")}
            className="btn btn-ghost btn-icon"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ fontSize: 18 }}
          >
            ←
          </motion.button>
          <div style={{
            width: 44, height: 44, borderRadius: "var(--radius-lg)",
            background: `linear-gradient(135deg, ${project.color}, ${project.color}88)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: `0 4px 16px ${project.color}33`,
          }}>
            {project.icon}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>{project.name}</h1>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{project.description}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Online users */}
          {onlineUsers.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{onlineUsers.length} online</span>
            </div>
          )}

          {/* Members */}
          <div className="avatar-stack">
            {allMembers.slice(0, 5).map((m: any, i: number) => (
              <div key={i} className="avatar avatar-sm" style={{ background: getAG(m.name || ""), color: "white" }} title={m.name}>
                {m.avatar || m.name?.[0]}
              </div>
            ))}
          </div>

          {/* Invite */}
          <motion.button className="btn btn-secondary btn-sm" whileHover={{ scale: 1.05 }} onClick={() => setShowInvite(!showInvite)}>
            + Invite
          </motion.button>

          {/* Zoom indicator */}
          <span style={{ fontSize: 11, color: "var(--text-muted)", padding: "4px 10px", background: "var(--surface)", borderRadius: "var(--radius-full)" }}>
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </motion.div>

      {/* Invite dropdown */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ padding: "0 28px", overflow: "hidden" }}
          >
            <form onSubmit={handleInvite} style={{ display: "flex", gap: 8, maxWidth: 440, marginTop: 12 }}>
              <input className="input" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Enter email to invite..." style={{ flex: 1, fontSize: 13 }} />
              <button type="submit" className="btn btn-primary btn-sm">Invite</button>
            </form>
            {inviteMsg && <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6, paddingLeft: 4 }}>{inviteMsg}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board */}
      <div
        ref={boardRef}
        onWheel={handleWheel}
        style={{
          flex: 1, overflowX: "auto", overflowY: "hidden",
          padding: "24px 28px 40px",
        }}
      >
        <motion.div
          animate={{ scale: zoom }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            display: "flex", gap: 20,
            transformOrigin: "top left",
            minHeight: "calc(100vh - 200px)",
          }}
        >
          {(project.columns || []).map((col: any, i: number) => (
            <BoardColumn
              key={col.id}
              column={col}
              onTaskClick={(task: any) => setSelectedTask(task)}
              onTaskAdd={handleTaskAdd}
              onDrop={handleDrop}
              draggedTask={draggedTask}
              setDraggedTask={setDraggedTask}
            />
          ))}

          {/* Add Column */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ background: "var(--surface-hover)", borderColor: "var(--glass-border-hover)" }}
            onClick={handleAddColumn}
            style={{
              width: 280, minWidth: 280, height: 52,
              background: "var(--surface)",
              border: "1px dashed var(--glass-border)",
              borderRadius: "var(--radius-lg)",
              color: "var(--text-muted)", cursor: "pointer",
              fontSize: 14, fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, flexShrink: 0, transition: "all 200ms",
            }}
          >
            + Add Column
          </motion.button>
        </motion.div>
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskModal
            task={selectedTask}
            projectMembers={allMembers}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleTaskUpdate}
            onDelete={handleTaskDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
