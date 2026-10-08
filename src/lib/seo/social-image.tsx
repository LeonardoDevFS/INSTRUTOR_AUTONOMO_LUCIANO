import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#070707",
          color: "#f5f5f5",
          padding: "72px 80px",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 560,
            height: 560,
            right: -100,
            top: -160,
            borderRadius: "50%",
            background: "rgba(229,185,63,0.15)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 260,
            height: 720,
            right: 155,
            bottom: -330,
            transform: "rotate(20deg)",
            borderLeft: "3px solid rgba(229,185,63,0.28)",
            borderRight: "3px solid rgba(229,185,63,0.28)",
            background: "rgba(229,185,63,0.06)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                display: "flex",
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#e5b93f",
              }}
            />
            <span
              style={{
                color: "#e5b93f",
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              {siteConfig.brand}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", maxWidth: 880 }}>
            <span
              style={{
                fontSize: 88,
                lineHeight: 0.92,
                fontWeight: 900,
                letterSpacing: -3,
                textTransform: "uppercase",
              }}
            >
              Mais que dirigir,
            </span>
            <span
              style={{
                marginTop: 12,
                color: "#e5b93f",
                fontSize: 88,
                lineHeight: 0.92,
                fontWeight: 900,
                letterSpacing: -3,
                textTransform: "uppercase",
              }}
            >
              é evoluir.
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(255,255,255,0.14)",
              paddingTop: 24,
              fontSize: 22,
              color: "rgba(255,255,255,0.65)",
            }}
          >
            <span>{siteConfig.name} • {siteConfig.profession}</span>
            <span>{siteConfig.location.city}/{siteConfig.location.state}</span>
          </div>
        </div>
      </div>
    ),
    socialImageSize,
  );
}
