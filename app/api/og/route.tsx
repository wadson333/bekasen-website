import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const SITE_NAME = "Bekasen";
const DEFAULT_TAGLINE = "Custom websites and management apps for Haitian businesses & diaspora.";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? SITE_NAME;
  const subtitle = searchParams.get("subtitle") ?? DEFAULT_TAGLINE;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a1033 60%, #2d1b6e 100%)",
          padding: "80px",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, fontWeight: 600 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #a78bfa, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            B
          </div>
          <span style={{ letterSpacing: "0.05em" }}>{SITE_NAME}</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
            gap: 20,
          }}
        >
          <h1
            style={{
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              margin: 0,
              maxWidth: 980,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 28,
              color: "#d8b4fe",
              margin: 0,
              maxWidth: 980,
              lineHeight: 1.3,
            }}
          >
            {subtitle}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 28,
            fontSize: 22,
            color: "#9ca3af",
          }}
        >
          <span>bekasen.com</span>
          <span>WEB · APPS · AI</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
