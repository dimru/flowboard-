"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const avatarColors = ["linear-gradient(135deg, #6366f1, #8b5cf6)", "linear-gradient(135deg, #ec4899, #f43f5e)", "linear-gradient(135deg, #06b6d4, #3b82f6)", "linear-gradient(135deg, #10b981, #06b6d4)", "linear-gradient(135deg, #f59e0b, #ef4444)"];
function getAC(name: string) { let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h); return avatarColors[Math.abs(h) % avatarColors.length]; }

interface TaskModalProps {
  task: any;
  projectMembers: any[];
  onClose: () => void;
  onUpdate: (task: any) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskModal({ task, projectMembers, onClose, onUpdate, onDelete }: TaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || "");
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split("T")[0] : "");
  const [comments, setComments] = useState<any[]>(task.comments || []);
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, priority, assigneeId: assigneeId || null, dueDate: dueDate || null }),
      });
      const updated = await res.json();
      onUpdate(updated);
    } catch (e) {}
    setSaving(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (e) {}
    setCommentLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onDelete(task.id);
    onClose();
  };

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal" style={{ maxWidth: 640, maxHeight: "90vh" }} initial={{ scale: 0.85, opacity: 0, filter: "blur(8px)" }} animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }} exit={{ scale: 0.85, opacity: 0, filter: "blur(8px)" }} transition={{ type: "spring", stiffness: 350, damping: 25 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className={`priority priority-${priority}`}>{priority}</span>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Task Details</span>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Title */}
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleSave} style={{ fontSize: 18, fontWeight: 700, background: "transparent", border: "1px solid transparent", padding: "8px 0", marginBottom: 16 }} />

        {/* Description */}
        <div className="input-group" style={{ marginBottom: 20 }}>
          <label>Description</label>
          <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} onBlur={handleSave} placeholder="Add a description..." rows={3} />
        </div>

        {/* Fields Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
          <div className="input-group">
            <label>Priority</label>
            <select className="input" value={priority} onChange={(e) => { setPriority(e.target.value); setTimeout(handleSave, 0); }}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div className="input-group">
            <label>Assignee</label>
            <select className="input" value={assigneeId} onChange={(e) => { setAssigneeId(e.target.value); setTimeout(handleSave, 0); }}>
              <option value="">Unassigned</option>
              {projectMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Due Date</label>
            <input type="date" className="input" value={dueDate} onChange={(e) => { setDueDate(e.target.value); setTimeout(handleSave, 0); }} />
          </div>
        </div>

        {/* Comments */}
        <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: 20 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text-secondary)" }}>
            Comments ({comments.length})
          </h4>

          <div style={{ maxHeight: 220, overflowY: "auto", marginBottom: 16 }}>
            {comments.map((c: any, i: number) => (
              <motion.div key={c.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div className="avatar avatar-sm" style={{ background: getAC(c.user?.name || ""), color: "white", marginTop: 2 }}>
                  {c.user?.avatar || "?"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{c.user?.name}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : ""}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 3, lineHeight: 1.5 }}>{c.content}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <form onSubmit={handleAddComment} style={{ display: "flex", gap: 8 }}>
            <input className="input" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." style={{ flex: 1 }} />
            <button type="submit" className="btn btn-primary btn-sm" disabled={commentLoading || !newComment.trim()}>
              {commentLoading ? "..." : "Send"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--glass-border)" }}>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete Task</button>
          <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
            Created {task.createdAt ? formatDistanceToNow(new Date(task.createdAt), { addSuffix: true }) : ""}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
