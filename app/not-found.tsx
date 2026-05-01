import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0a0a0f", color: "#e5e7eb" }}>
        <main style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.875rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#a78bfa" }}>
            Bekasen
          </p>
          <h1 style={{ fontSize: "3rem", fontWeight: 700, marginTop: "0.75rem" }}>Page not found</h1>
          <p style={{ marginTop: "1rem", maxWidth: "32rem", color: "#9ca3af" }}>
            This page does not exist or has moved. Head back to the homepage.
          </p>
          <Link
            href="/"
            style={{ marginTop: "2rem", display: "inline-flex", height: "3rem", alignItems: "center", gap: "0.5rem", borderRadius: "9999px", background: "#7c3aed", padding: "0 1.5rem", fontSize: "0.875rem", fontWeight: 500, color: "#fff", textDecoration: "none" }}
          >
            Back to home
          </Link>
        </main>
      </body>
    </html>
  );
}
