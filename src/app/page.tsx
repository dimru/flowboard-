"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

const shapes = [
  { size: 120, color: "#6366f1", x: "10%", y: "20%", type: "circle" },
  { size: 80, color: "#ec4899", x: "80%", y: "15%", type: "square" },
  { size: 100, color: "#06b6d4", x: "70%", y: "60%", type: "circle" },
  { size: 60, color: "#10b981", x: "20%", y: "70%", type: "ring" },
  { size: 90, color: "#f59e0b", x: "50%", y: "40%", type: "square" },
  { size: 70, color: "#8b5cf6", x: "85%", y: "80%", type: "ring" },
];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.85]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const featuresY = useTransform(scrollYProgress, [0.15, 0.4], [100, 0]);
  const featuresOpacity = useTransform(scrollYProgress, [0.15, 0.35], [0, 1]);

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  if (status === "loading") {
    return <div className="loading-screen"><div className="spinner" /><span style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading...</span></div>;
  }

  if (status === "authenticated") return null;

  const features = [
    { icon: "🏗️", title: "Spatial Boards", desc: "Drag, zoom, and pan your kanban boards in an infinite canvas." },
    { icon: "⚡", title: "Real-Time Sync", desc: "See changes instantly across all connected users via WebSockets." },
    { icon: "🎨", title: "2026 Design", desc: "Aurora backgrounds, glass-morphism, page-peel transitions." },
    { icon: "👥", title: "Team Collaboration", desc: "Assign tasks, comment, and track progress together." },
    { icon: "🔔", title: "Live Notifications", desc: "Get instant alerts for assignments, comments, and updates." },
    { icon: "🔐", title: "Secure Auth", desc: "Full authentication with encrypted passwords and JWT sessions." },
  ];

  return (
    <div ref={containerRef} style={{ minHeight: "200vh" }}>
      {/* Floating Shapes */}
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className={`floating-shape ${s.type === "circle" ? "shape-circle" : s.type === "ring" ? "shape-ring" : ""}`}
          style={{
            width: s.size, height: s.size,
            left: s.x, top: s.y,
            background: s.type !== "ring" ? s.color : "transparent",
            borderColor: s.type === "ring" ? s.color : undefined,
            opacity: 0.08,
          }}
          animate={{
            y: [0, -30 + i * 10, 20 - i * 5, 0],
            rotate: [0, 10 + i * 3, -5 + i * 2, 0],
            scale: [1, 1.05, 0.97, 1],
          }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Hero Section */}
      <motion.section style={{ scale: heroScale, opacity: heroOpacity, y: heroY, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px", position: "relative" }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }} style={{ width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg, #6366f1, #ec4899)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 900, color: "white", marginBottom: 32, boxShadow: "0 16px 64px rgba(99,102,241,0.4)" }}>
            F
          </motion.div>
          <h1 style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 20, maxWidth: 700 }}>
            Project Management,{" "}
            <span className="text-gradient">Reimagined</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7 }}>
            The collaborative workspace that feels alive. Spatial boards, real-time sync, and animations that belong in 2026.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login">
              <motion.button className="btn btn-primary btn-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} style={{ fontSize: 16, padding: "16px 36px" }}>
                Get Started →
              </motion.button>
            </Link>
            <Link href="/register">
              <motion.button className="btn btn-secondary btn-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                Create Account
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ position: "absolute", bottom: 40, color: "var(--text-muted)", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span>Scroll to explore</span>
          <span style={{ fontSize: 20 }}>↓</span>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section style={{ y: featuresY, opacity: featuresOpacity, padding: "80px 24px 120px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 36, fontWeight: 800, marginBottom: 60 }}>
          Why <span className="text-gradient">FlowBoard</span>?
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="glass card-hover-lift"
              initial={{ opacity: 0, y: 40, rotateX: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ padding: 28, cursor: "default" }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
