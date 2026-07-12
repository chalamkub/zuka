"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="th">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0a",
          color: "#fafafa",
          padding: "1rem",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <p style={{ fontSize: "2rem", fontWeight: 600, margin: 0 }}>
            เกิดข้อผิดพลาดร้ายแรง
          </p>
          <p style={{ marginTop: "0.75rem", color: "#a3a3a3", fontSize: "0.9rem" }}>
            ระบบไม่สามารถทำงานต่อได้ กรุณาลองใหม่อีกครั้ง
          </p>
          {error.digest && (
            <p style={{ marginTop: "0.5rem", color: "#737373", fontSize: "0.75rem" }}>
              รหัสอ้างอิง: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.5rem 1.25rem",
              borderRadius: "9999px",
              border: "none",
              background: "#fafafa",
              color: "#0a0a0a",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            ลองใหม่
          </button>
        </div>
      </body>
    </html>
  )
}
