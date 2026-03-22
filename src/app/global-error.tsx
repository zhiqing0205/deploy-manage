"use client";

// Workaround: explicit global-error boundary avoids Next.js 16 prerender bug
// with auto-generated _global-error when using next/font.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "1rem" }}>出了点问题</h2>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>应用遇到了意外错误，请重试。</p>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.5rem 1rem",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          重试
        </button>
      </body>
    </html>
  );
}
