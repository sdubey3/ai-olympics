"use client";

import React from "react";

interface HeaderProps {
  edition: string;
  title: string;
  subtitle: string;
  navItems: { id: string; label: string; href: string; active?: boolean }[];
  isLive?: boolean;
}

export function Header({ edition, title, subtitle, navItems, isLive = false }: HeaderProps) {
  return (
    <header>
      <div
        className="star-bg"
        style={{
          borderBottom: "4px solid #fff",
          padding: "20px 24px 16px",
        }}
      >
        <div
          style={{
            fontSize: 7,
            color: "#888",
            letterSpacing: 3,
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          {edition}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div style={{ fontSize: 16, letterSpacing: 2 }}>{title}</div>
          {isLive && (
            <div className="blink" style={{ fontSize: 8, color: "#FFD700" }}>
              ● LIVE
            </div>
          )}
        </div>
        <div style={{ fontSize: 7, color: "#555", marginTop: 6 }}>{subtitle}</div>
      </div>

      {/* Nav tabs */}
      <nav style={{ display: "flex", borderBottom: "4px solid #fff" }}>
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            style={{
              flex: 1,
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7,
              padding: "12px 8px",
              border: "none",
              borderRight: "2px solid #333",
              cursor: "pointer",
              background: item.active ? "#fff" : "#000",
              color: item.active ? "#000" : "#888",
              letterSpacing: 1,
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
