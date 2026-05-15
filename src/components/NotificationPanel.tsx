"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  linkedProjectId?: string;
  linkedTaskId?: string;
}

const typeIcons: Record<string, string> = {
  TASK_ASSIGNED: "📌",
  COMMENT: "💬",
  PROJECT_INVITE: "📨",
  TASK_COMPLETED: "✅",
  MENTION: "🏷️",
};

export default function NotificationPanel({
  onClose,
  onCountChange,
}: {
  onClose: () => void;
  onCountChange: (n: number) => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
          onCountChange(data.filter((n) => !n.read).length);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    onCountChange(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{
        position: "fixed",
        right: 16,
        top: 72,
        width: 380,
        maxHeight: "calc(100vh - 100px)",
        background: "var(--bg-secondary)",
        border: "1px solid var(--glass-border)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-lg)",
        zIndex: 150,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "20px 20px 16px",
        borderBottom: "1px solid var(--glass-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Notifications</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {notifications.some((n) => !n.read) && (
            <button onClick={markAllRead} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="modal-close">×</button>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {loading ? (
          <div className="flex-center" style={{ padding: 40 }}>
            <div className="spinner" />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
            No notifications yet
          </div>
        ) : (
          notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                background: n.read ? "transparent" : "rgba(99, 102, 241, 0.06)",
                marginBottom: 2,
                cursor: "pointer",
                transition: "background 150ms",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? "transparent" : "rgba(99, 102, 241, 0.06)")}
            >
              <span style={{ fontSize: 20, lineHeight: 1, marginTop: 2 }}>
                {typeIcons[n.type] || "📢"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: n.read ? "var(--text-secondary)" : "var(--text-primary)" }}>
                  {n.message}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </div>
              </div>
              {!n.read && (
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "var(--accent)", flexShrink: 0, marginTop: 6,
                }} />
              )}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
