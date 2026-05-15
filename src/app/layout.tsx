import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import SocketProvider from "@/components/SocketProvider";

export const metadata: Metadata = {
  title: "FlowBoard — Next-Gen Project Management",
  description:
    "A collaborative project management tool with spatial boards, real-time updates, and immersive 2026 design.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SocketProvider>
            {/* Aurora Background */}
            <div className="aurora-bg" aria-hidden="true">
              <div className="aurora-blob" />
              <div className="aurora-blob" />
              <div className="aurora-blob" />
              <div className="aurora-blob" />
            </div>
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
