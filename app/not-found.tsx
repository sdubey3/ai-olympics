import Link from "next/link";

export default function NotFound() {
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
      <div style={{ fontSize: 28, color: "#FFD700" }}>404</div>
      <div style={{ fontSize: 9, color: "#888" }}>EVENT NOT FOUND</div>
      <Link
        href="/"
        className="pixel-btn"
        style={{
          background: "transparent",
          color: "#fff",
          borderColor: "#fff",
          boxShadow: "4px 4px 0 #fff",
          textDecoration: "none",
        }}
      >
        ← BACK TO SCHEDULE
      </Link>
    </div>
  );
}
