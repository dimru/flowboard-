"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const projectColors = [
  "#6366f1", "#ec4899", "#06b6d4", "#10b981", "#f59e0b",
  "#8b5cf6", "#f43f5e", "#14b8a6", "#3b82f6", "#a855f7",
];
const projectIcons = ["📋","🚀","📣","💡","🎯","⚡","🔥","🌟","📦","🎨"];

export default function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: any) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [icon, setIcon] = useState("📋");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Project name is required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), color, icon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreated(data);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal" initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Project</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex-center" style={{ marginBottom: 24 }}>
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} style={{ width: 80, height: 80, borderRadius: "var(--radius-xl)", background: `linear-gradient(135deg, ${color}, ${color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: `0 8px 32px ${color}44` }}>
              {icon}
            </motion.div>
          </div>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Project Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Website Redesign" autoFocus />
          </div>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Description</label>
            <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this project about?" rows={3} />
          </div>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Icon</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {projectIcons.map((ic) => (
                <motion.button key={ic} type="button" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => setIcon(ic)} style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", border: icon === ic ? "2px solid var(--accent)" : "1px solid var(--glass-border)", background: icon === ic ? "var(--surface-hover)" : "var(--surface)", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {ic}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="input-group" style={{ marginBottom: 24 }}>
            <label>Color</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {projectColors.map((c) => (
                <motion.button key={c} type="button" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => setColor(c)} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: color === c ? "3px solid white" : "2px solid transparent", cursor: "pointer", boxShadow: color === c ? `0 0 16px ${c}88` : "none" }} />
              ))}
            </div>
          </div>
          {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Creating..." : "Create Project"}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
