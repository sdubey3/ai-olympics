export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#000",
      }}
    >
      <div className="blink" style={{ fontSize: 9, color: "#FFD700", letterSpacing: 2 }}>
        LOADING...
      </div>
    </div>
  );
}
