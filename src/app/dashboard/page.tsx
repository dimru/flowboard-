"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Navbar from "@/components/Navbar";
import CreateProjectModal from "@/components/CreateProjectModal";

const cardColors: Record<string, string> = {};
function getCardGradient(color: string) {
  return `linear-gradient(135deg, ${color}22, ${color}08)`;
}

const avatarGradients = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #10b981, #06b6d4)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
];
function getAvatarGrad(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return avatarGradients[Math.abs(h) % avatarGradients.length];
}

// 3D tilt card component
function TiltCard({ children, color, onClick }: { children: React.ReactNode; color: string; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 300, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 20 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(y * -12);
    rotateY.set(x * 12);
  };
  const handleLeave = () => { rotateX.set(0); rotateY.set(0); };

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{
        rotateX: springX, rotateY: springY, transformPerspective: 800,
        background: getCardGradient(color),
        border: `1px solid ${color}25`,
        borderRadius: "var(--radius-xl)",
        padding: 28,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        willChange: "transform",
      }}
      whileHover={{ boxShadow: `0 20px 60px ${color}20, 0 0 40px ${color}10` }}
    >
      {/* Glow orb */}
      <div style={{
        position: "absolute", top: -40, right: -40, width: 120, height: 120,
        borderRadius: "50%", background: color, opacity: 0.07, filter: "blur(40px)",
      }} />
      {children}
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setProjects(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status]);

  if (status !== "authenticated") {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <main className="page-peel-enter" style={{ paddingTop: 100, paddingBottom: 60, maxWidth: 1200, margin: "0 auto", padding: "100px 28px 60px" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 48 }}
        >
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 6 }}>
            {greeting()}, <span className="text-gradient">{session.user?.name?.split(" ")[0]}</span> 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            {projects.length > 0 ? `You have ${projects.length} active project${projects.length > 1 ? "s" : ""}` : "Start by creating your first project"}
          </p>
        </motion.div>

        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Your Projects</h2>
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(true)}
          >
            <span style={{ fontSize: 18 }}>+</span> New Project
          </motion.button>
        </motion.div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex-center" style={{ padding: 80 }}><div className="spinner" /></div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass"
            style={{ padding: 60, textAlign: "center" }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No projects yet</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 14 }}>Create your first project to get started</p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create Project</button>
          </motion.div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 40, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard color={project.color} onClick={() => router.push(`/project/${project.id}`)}>
                  {/* Icon + Title */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "var(--radius-lg)",
                      background: `linear-gradient(135deg, ${project.color}, ${project.color}88)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 24, boxShadow: `0 4px 16px ${project.color}33`,
                    }}>
                      {project.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 className="truncate" style={{ fontSize: 17, fontWeight: 700 }}>{project.name}</h3>
                      <p className="truncate" style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        {project.description || "No description"}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "flex", gap: 20, marginBottom: 18 }}>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: project.color }}>{project.taskCount || 0}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Tasks</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: project.color }}>{project.memberCount || 0}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Members</div>
                    </div>
                  </div>

                  {/* Members */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div className="avatar-stack">
                      {(project.members || []).slice(0, 4).map((m: any, j: number) => (
                        <div key={j} className="avatar avatar-sm" style={{ background: getAvatarGrad(m.name || ""), color: "white" }}>
                          {m.avatar || m.name?.[0] || "?"}
                        </div>
                      ))}
                      {(project.members || []).length > 4 && (
                        <div className="avatar avatar-sm" style={{ background: "var(--surface)", color: "var(--text-muted)", fontSize: 9 }}>
                          +{project.members.length - 4}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {project.owner?.name === session.user?.name ? "Owner" : "Member"}
                    </span>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateProjectModal
            onClose={() => setShowCreate(false)}
            onCreated={(p) => setProjects((prev) => [p, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
