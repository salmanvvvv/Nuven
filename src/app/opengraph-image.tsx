import { ImageResponse } from "next/og";
import { getDictionary } from "@/content";
import { LEFT_BAR, RIBBON, RIGHT_BAR } from "@/components/brand-paths";

const { site } = getDictionary();

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 40%, #1a1a1a 0%, #000 60%)",
          color: "#fafafa",
        }}
      >
        <svg width="220" height="176" viewBox="0 0 100 80">
          <defs>
            <linearGradient id="l" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#f2f2f2" />
              <stop offset="1" stopColor="#8e8e8e" />
            </linearGradient>
            <linearGradient id="r" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#dedede" />
              <stop offset="1" stopColor="#5e5e5e" />
            </linearGradient>
            <linearGradient id="d" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#d9d9d9" />
            </linearGradient>
          </defs>
          <path d={LEFT_BAR} fill="url(#l)" />
          <path d={RIGHT_BAR} fill="url(#r)" />
          <path d={RIBBON} fill="url(#d)" />
        </svg>
        <div style={{ marginTop: 48, fontSize: 64, letterSpacing: 26, paddingLeft: 26, fontWeight: 500 }}>NUVEN</div>
        <div style={{ marginTop: 14, fontSize: 22, letterSpacing: 14, paddingLeft: 14, color: "#a3a3a3" }}>DIGITAL</div>
        <div style={{ marginTop: 56, fontSize: 28, color: "#a3a3a3" }}>{site.tagline}</div>
      </div>
    ),
    size,
  );
}
