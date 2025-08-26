import React, { useEffect, useState, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";

export default function AskNetdataInline({
  widgetUrl = "https://fcd3e57ca366.ngrok-free.app/widget.html",
  height = 600,
  title = "Ask Netdata AI",
  className = "",
}) {
  const headerH = 44;
  const DURATION = 240;

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState("idle"); // "idle" | "enter" | "entered" | "exit"
  const [overlayLoaded, setOverlayLoaded] = useState(false); // fades overlay iframe in only after load

  const panelRef = useRef(null);

  const openOverlay = useCallback(() => {
    // start fading inline content out
    setPhase("enter");
    // mount overlay next frame (so inline cover starts animating immediately)
    requestAnimationFrame(() => {
      setOpen(true);
      // give React a tick so overlay is mounted, then animate panel in
      requestAnimationFrame(() => setPhase("entered"));
    });
  }, []);

  const closeOverlay = useCallback(() => {
    // fade overlay out
    setPhase("exit");
    // after animation ends, unmount overlay & clear load flag
    setTimeout(() => {
      setOpen(false);
      setOverlayLoaded(false);
      setPhase("idle"); // inline cover will fade away automatically
    }, DURATION);
  }, [DURATION]);

  // lock body scroll + ESC while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && closeOverlay();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, closeOverlay]);

  // ---- styles
  const inlineContainerStyle = {
    position: "relative",
    overflow: "hidden",
    borderRadius: 12,
    background: "var(--nd-card-bg)",
  };

  const inlineIframeStyle = {
    width: "100%",
    height,
    border: "none",
    display: "block",
  };

  // A cover that sits over the inline iframe and fades in on maximize
  const inlineCoverStyle = {
    position: "absolute",
    inset: 0,
    background: "var(--nd-card-bg)",
    transition: `opacity ${DURATION}ms cubic-bezier(.2,.8,.2,1)`,
    pointerEvents: "none",
    opacity: phase === "enter" || phase === "entered" ? 1 : 0, // fade in while opening
  };

  // overlay bits
  const backdropStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 9998,
    background: "rgba(0,0,0,0.4)",
    transition: `opacity ${DURATION}ms cubic-bezier(.2,.8,.2,1)`,
    opacity: phase === "entered" ? 1 : 0,
  };

  const panelStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    overflow: "hidden",
    borderRadius: 0,
    background: "var(--nd-card-bg)",
    transition: `transform ${DURATION}ms cubic-bezier(.2,.8,.2,1), opacity ${DURATION}ms cubic-bezier(.2,.8,.2,1)`,
    transform:
      phase === "entered" ? "translateY(0) scale(1)" : "translateY(8px) scale(0.98)",
    opacity: phase === "entered" ? 1 : 0,
    willChange: "transform, opacity",
  };

  // overlay iframe: start hidden; fade in after onLoad so there's no white flash
  const overlayIframeStyle = {
    width: "100%",
    height: `calc(100vh - ${headerH}px)`,
    border: "none",
    display: "block",
    transition: `opacity ${DURATION}ms ease`,
    opacity: overlayLoaded ? 1 : 0,
  };

  return (
    <>
      {/* Inline card (always present) */}
      <div className={`nd-card ${className}`} style={inlineContainerStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: headerH,
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
            onClick={openOverlay}
            aria-label="Maximize"
            title="Maximize"
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
            Maximize
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 14H5V19H10V17H7V14ZM5 10H7V7H10V5H5V10ZM17 17H14V19H19V14H17V17ZM14 5V7H17V10H19V5H14Z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <iframe src={widgetUrl} title="Ask Netdata" loading="lazy" style={inlineIframeStyle} />
        {/* fades over the iframe while opening to hide content blink */}
        <div style={inlineCoverStyle} />
      </div>

      {/* Overlay in portal */}
      {typeof window !== "undefined" &&
        createPortal(
          <>
            {/* Backdrop */}
            {open && <div aria-hidden="true" style={backdropStyle} onClick={closeOverlay} />}

            {/* Panel */}
            {open && (
              <div
                ref={panelRef}
                className="nd-card"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                style={panelStyle}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: headerH,
                    padding: "0 12px",
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

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      onClick={closeOverlay}
                      aria-label="Restore"
                      title="Restore"
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
                      Restore
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 16H8V19H10V14H5V16ZM8 8H5V10H10V5H8V8ZM14 19H16V16H19V14H14V19ZM16 8V5H14V10H19V8H16Z" fill="currentColor"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={closeOverlay}
                      aria-label="Close"
                      title="Close"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: 6,
                        borderRadius: 8,
                        border: "1px solid var(--nd-card-border)",
                        background: "transparent",
                        color: "var(--ifm-font-color-base)",
                        cursor: "pointer",
                        lineHeight: 0,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Overlay iframe (fades in on load to avoid white flash) */}
                <iframe
                  src={widgetUrl}
                  title="Ask Netdata"
                  loading="eager"
                  style={overlayIframeStyle}
                  onLoad={() => setOverlayLoaded(true)}
                />
              </div>
            )}
          </>,
          document.body
        )}
    </>
  );
}

AskNetdataInline.propTypes = {
  widgetUrl: PropTypes.string,
  height: PropTypes.number,
  title: PropTypes.string,
  className: PropTypes.string,
};
