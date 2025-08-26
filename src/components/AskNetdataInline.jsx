import React from "react";
import PropTypes from "prop-types";

export default function AskNetdataInline({
  widgetUrl = "https://fcd3e57ca366.ngrok-free.app/widget.html",
  height = 600,
  title = "Ask Netdata AI",
  className = "",
}) {
  return (
    <div
      className={`nd-card ${className}`}
      style={{
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 44,
          padding: "0 10px",
          borderBottom: "1px solid var(--nd-card-border)",
          background: "var(--nd-card-bg)",
          fontWeight: 600,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L2 7V12C2 16.55 4.84 20.74 9 22C13.16 20.74 22 16.55 22 12V7L12 2Z" fill="#00AB44"/>
          </svg>
          {title}
        </span>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.openAskNetdata) {
              window.openAskNetdata(true);
            }
          }}
          aria-label="Pop out to floating chat"
          title="Pop out to floating chat"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid var(--ifm-color-primary)",
            background: "transparent",
            color: "var(--ifm-color-primary)",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          Pop out
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M14 3H21V10H19V6.41L10.41 15L9 13.59L17.59 5H14V3Z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      {/* Chat iframe */}
      <iframe
        src={widgetUrl}
        title="Ask Netdata"
        loading="lazy"
        style={{ width: "100%", height, border: "none", display: "block" }}
      />
    </div>
  );
}

AskNetdataInline.propTypes = {
  widgetUrl: PropTypes.string,
  height: PropTypes.number,
  title: PropTypes.string,
  className: PropTypes.string,
};
