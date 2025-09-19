// Central color constants for Ask Netdata components.
// Source of truth so both full AskNetdata and AskNetdataWidget stay in sync.
// If you adjust these, ensure any derived/contrast variants in AskNetdata adapt accordingly.

export const ASKNET_PRIMARY = '#0eb6f0ff'; // Main accent (can be 6 or 8 digit hex)
export const ASKNET_SECOND = '#00ab44';    // Secondary accent (search / alternate state)

// --- Utility helpers (keep tiny & dependency‑free) ---
// Accepts #RGB, #RRGGBB, #RRGGBBAA (alpha ignored for rgb)
export function hexToRgbTuple(hex) {
	if (!hex) return [0,0,0];
	let h = hex.trim();
	if (h.startsWith('#')) h = h.slice(1);
	if (h.length === 3) { // short form
		h = h.split('').map(c => c + c).join('');
	}
	if (h.length === 8) { // RRGGBBAA -> ignore AA
		h = h.slice(0,6);
	}
	if (h.length !== 6) return [0,0,0];
	const intVals = [h.slice(0,2), h.slice(2,4), h.slice(4,6)].map(x => parseInt(x,16));
	// Validate all numeric; if any NaN fall back to black to avoid runtime errors
	return intVals.every(v => Number.isFinite(v)) ? intVals : [0,0,0];
}

export function rgbString(hex) {
	const [r,g,b] = hexToRgbTuple(hex);
	return `${r},${g},${b}`;
}

export function rgba(hex, a=1) {
	return `rgba(${rgbString(hex)},${a})`;
}

// Semantic opacity helpers used across components
export const OPACITY = {
	dimLight: 0.28,   // dimmed background (light mode)
	dimDark: 0.42,    // dimmed background (dark mode)
	focusRing: 0.35,  // focus halo
	glowStrong: 0.32, // loader / glow primary
	glowSoft: 0.16    // loader / glow secondary
};

export default { ASKNET_PRIMARY, ASKNET_SECOND, hexToRgbTuple, rgbString, rgba, OPACITY };
