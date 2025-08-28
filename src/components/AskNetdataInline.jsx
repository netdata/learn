import React, { useEffect, useState, useCallback, useRef } from "react";
import PropTypes from "prop-types";

export default function AskNetdataInline({
  widgetUrl = "https://agent-events.netdata.cloud/ask-netdata/widget",
  height = 600,
  title = "Ask Netdata AI",
  className = "",
}) {
  const headerH = 44;
  const DURATION = 220;
  const REVEAL_DELAY = 30; // small delay so the switch to fixed happens fully under cover

  const [isMax, setIsMax] = useState(false);
  const [coverOn, setCoverOn] = useState(false); // fades over iframe during transitions
  const timeouts = useRef([]);

  const clearTimers = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  };

  const open = useCallback(() => {
    clearTimers();
    // 1) Fade cover ON over inline card
    setCoverOn(true);

    // 2) After cover is opaque, switch to fixed fullscreen (still covered)
    timeouts.current.push(
      setTimeout(() => {
        setIsMax(true);

        // 3) After a tiny delay, fade cover OFF to reveal fullscreen
        timeouts.current.push(
          setTimeout(() => setCoverOn(false), REVEAL_DELAY)
        );
      }, DURATION)
    );
  }, []);

  const close = useCallback(() => {
    clearTimers();
    // 1) Fade cover ON over fullscreen
    setCoverOn(true);

    // 2) After cover is opaque, switch back to inline (still covered)
    timeouts.current.push(
      setTimeout(() => {
        setIsMax(false);

        // 3) After a tiny delay, fade cover OFF to reveal inline
        timeouts.current.push(
          setTimeout(() => setCoverOn(false), REVEAL_DELAY)
        );
      }, DURATION)
    );
  }, []);

  useEffect(() => () => clearTimers(), []);

  // Lock body scroll while maximized + ESC + scrollbar compensation
  useEffect(() => {
    if (!isMax) return;

    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    const applyComp = () => {
      const sw = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
      if (sw > 0) document.body.style.paddingRight = `${sw}px`;
    };

    document.body.style.overflow = "hidden";
    applyComp();
    const onResize = () => applyComp();
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      window.removeEventListener("resize", onResize);
    };
  }, [isMax, close]);

  // Styles (fade only, no transform/scale anywhere)
  const wrapperStyle = isMax
    ? {
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      overflow: "hidden",
      borderRadius: 0,
      background: "var(--nd-card-bg)",
    }
    : {
      position: "relative",
      overflow: "hidden",
      borderRadius: 12,
      background: "var(--nd-card-bg)",
    };

  const coverStyle = {
    position: "absolute",
    inset: 0,
    background: "var(--nd-card-bg)",
    transition: `opacity ${DURATION}ms ease`,
    pointerEvents: "none",
    opacity: coverOn ? 1 : 0,
  };

  const iframeStyle = isMax
    ? { width: "100%", height: `calc(100vh - ${headerH}px)`, border: "none", display: "block" }
    : { width: "100%", height, border: "none", display: "block" };

  const backdropStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 9998,
    background: "rgba(0,0,0,0.4)",
    transition: `opacity ${DURATION}ms ease`,
    opacity: isMax ? 1 : 0,
    pointerEvents: isMax ? "auto" : "none",
  };

  return (
    <>
      {/* Backdrop (fades in/out) */}
      <div aria-hidden="true" style={backdropStyle} onClick={close} />

      {/* SAME card + SAME iframe (state preserved) */}
      <div
        className={`nd-card ${className}`}
        style={wrapperStyle}
        role={isMax ? "dialog" : undefined}
        aria-modal={isMax ? "true" : undefined}
        aria-label={title}
      >
        {/* Header */}
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
            position: "relative",
            zIndex: 1,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L2 7V12C2 16.55 4.84 20.74 9 22C13.16 20.74 22 16.55 22 12V7L12 2Z" fill="#00AB44" />
            </svg> */}
            {title}
          </span>

          {!isMax ? (
            <button
              type="button"
              onClick={open}
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
                <path d="M7 14H5V19H10V17H7V14ZM5 10H7V7H10V5H5V10ZM17 17H14V19H19V14H17V17ZM14 5V7H17V10H19V5H14Z" fill="currentColor" />
              </svg>
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                onClick={close}
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
                  <path d="M5 16H8V19H10V14H5V16ZM8 8H5V10H10V5H8V8ZM14 19H16V16H19V14H14V19ZM16 8V5H14V10H19V8H16Z" fill="currentColor" />
                </svg>
              </button>

              <button
                type="button"
                onClick={close}
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
                  <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* SAME iframe (state persists) */}
        <iframe src={widgetUrl} title="Ask Netdata" loading="lazy" style={iframeStyle} />

        {/* Fade cover to hide any repaint during the switch */}
        <div style={coverStyle} />
      </div>
    </>
  );
}

AskNetdataInline.propTypes = {
  widgetUrl: PropTypes.string,
  height: PropTypes.number,
  title: PropTypes.string,
  className: PropTypes.string,
};
