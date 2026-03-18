"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div style={{ padding: "80px 24px", textAlign: "center" }}>
      <h3 style={{ fontSize: 20, color: "#d32f2f", margin: "0 0 12px" }}>
        Une erreur est survenue
      </h3>
      <p style={{ color: "#888", margin: "0 0 24px" }}>{error.message}</p>
      <button
        onClick={reset}
        style={{
          padding: "10px 24px",
          fontSize: 14,
          border: "1px solid #ccc",
          borderRadius: 6,
          background: "#fff",
          cursor: "pointer",
        }}
      >
        Réessayer
      </button>
    </div>
  );
}
