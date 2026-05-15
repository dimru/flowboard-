"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

const demoUsers = [
  { name: "Alice Johnson", email: "alice@demo.com", avatar: "AJ" },
  { name: "Bob Smith", email: "bob@demo.com", avatar: "BS" },
  { name: "Carol Williams", email: "carol@demo.com", avatar: "CW" },
  { name: "Dave Chen", email: "dave@demo.com", avatar: "DC" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent, loginEmail?: string, loginPassword?: string) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email: loginEmail || email,
      password: loginPassword || password,
      redirect: false,
    });
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const quickLogin = async (demoEmail: string) => {
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email: demoEmail, password: "password123", redirect: false });
    if (result?.error) { setError(result.error); setLoading(false); }
    else router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <motion.div
        className="page-peel-enter"
        style={{ width: "100%", maxWidth: 440, background: "var(--bg-secondary)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-xl)", padding: 36, boxShadow: "var(--shadow-lg), 0 0 80px rgba(99,102,241,0.08)" }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #6366f1, #ec4899)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "white", marginBottom: 16 }}>
            F
          </motion.div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Welcome Back</h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>Sign in to your FlowBoard workspace</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="input-group" style={{ marginBottom: 24 }}>
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 16, textAlign: "center" }}>{error}</div>}
          <motion.button type="submit" className="btn btn-primary" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ width: "100%", padding: "14px", fontSize: 15, fontWeight: 600 }}>
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>

        <div style={{ textAlign: "center", margin: "20px 0", color: "var(--text-muted)", fontSize: 12 }}>— or quick login as —</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {demoUsers.map((u) => (
            <motion.button
              key={u.email}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => quickLogin(u.email)}
              disabled={loading}
              style={{
                padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-md)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", color: "var(--text-primary)", fontSize: 13, transition: "all 150ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--glass-border-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--glass-border)")}
            >
              <span style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white", flexShrink: 0 }}>
                {u.avatar}
              </span>
              {u.name.split(" ")[0]}
            </motion.button>
          ))}
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--text-secondary)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "var(--accent-light)", textDecoration: "none", fontWeight: 600 }}>Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
