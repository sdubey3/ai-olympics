"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#000",
        gap: 20,
        padding: 24,
      }}
    >
      <div style={{ fontSize: 14, color: "#E53E3E" }}>ERROR</div>
      <div style={{ fontSize: 7, color: "#888", textAlign: "center", lineHeight: 2 }}>
        {error.message || "Something went wrong"}
      </div>
      <button
        className="pixel-btn"
        onClick={reset}
        style={{
          background: "transparent",
          color: "#fff",
          borderColor: "#fff",
          boxShadow: "4px 4px 0 #fff",
        }}
      >
        TRY AGAIN
      </button>
    </div>
  );
}
