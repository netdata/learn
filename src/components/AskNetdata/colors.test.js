import { describe, it, expect } from 'vitest';
import {
  ASKNET_PRIMARY,
  ASKNET_SECOND,
  hexToRgbTuple,
  rgbString,
  rgba,
  OPACITY,
} from './colors';

describe('AskNetdata colors', () => {
  describe('color constants', () => {
    it('should export ASKNET_PRIMARY as a valid hex color', () => {
      expect(ASKNET_PRIMARY).toBeDefined();
      expect(ASKNET_PRIMARY).toMatch(/^#[0-9a-fA-F]{6,8}$/);
    });

    it('should export ASKNET_SECOND as a valid hex color', () => {
      expect(ASKNET_SECOND).toBeDefined();
      expect(ASKNET_SECOND).toMatch(/^#[0-9a-fA-F]{6,8}$/);
    });

    it('should export OPACITY object with all required keys', () => {
      expect(OPACITY).toBeDefined();
      expect(OPACITY).toHaveProperty('dimLight');
      expect(OPACITY).toHaveProperty('dimDark');
      expect(OPACITY).toHaveProperty('focusRing');
      expect(OPACITY).toHaveProperty('glowStrong');
      expect(OPACITY).toHaveProperty('glowSoft');
    });

    it('should have opacity values between 0 and 1', () => {
      Object.values(OPACITY).forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('hexToRgbTuple', () => {
    it('should convert 6-digit hex to RGB tuple', () => {
      expect(hexToRgbTuple('#ff0000')).toEqual([255, 0, 0]);
      expect(hexToRgbTuple('#00ff00')).toEqual([0, 255, 0]);
      expect(hexToRgbTuple('#0000ff')).toEqual([0, 0, 255]);
      expect(hexToRgbTuple('#ffffff')).toEqual([255, 255, 255]);
      expect(hexToRgbTuple('#000000')).toEqual([0, 0, 0]);
    });

    it('should convert 3-digit hex (short form) to RGB tuple', () => {
      expect(hexToRgbTuple('#f00')).toEqual([255, 0, 0]);
      expect(hexToRgbTuple('#0f0')).toEqual([0, 255, 0]);
      expect(hexToRgbTuple('#00f')).toEqual([0, 0, 255]);
      expect(hexToRgbTuple('#fff')).toEqual([255, 255, 255]);
      expect(hexToRgbTuple('#000')).toEqual([0, 0, 0]);
    });

    it('should convert 8-digit hex (with alpha) to RGB tuple, ignoring alpha', () => {
      expect(hexToRgbTuple('#ff0000ff')).toEqual([255, 0, 0]);
      expect(hexToRgbTuple('#00ff0080')).toEqual([0, 255, 0]);
      expect(hexToRgbTuple('#0000ff00')).toEqual([0, 0, 255]);
    });

    it('should handle hex without # prefix', () => {
      expect(hexToRgbTuple('ff0000')).toEqual([255, 0, 0]);
      expect(hexToRgbTuple('fff')).toEqual([255, 255, 255]);
    });

    it('should handle hex with leading/trailing whitespace', () => {
      expect(hexToRgbTuple('  #ff0000  ')).toEqual([255, 0, 0]);
      expect(hexToRgbTuple(' fff ')).toEqual([255, 255, 255]);
    });

    it('should return [0,0,0] for invalid input', () => {
      expect(hexToRgbTuple(null)).toEqual([0, 0, 0]);
      expect(hexToRgbTuple(undefined)).toEqual([0, 0, 0]);
      expect(hexToRgbTuple('')).toEqual([0, 0, 0]);
      expect(hexToRgbTuple('#')).toEqual([0, 0, 0]);
      expect(hexToRgbTuple('#gg0000')).toEqual([0, 0, 0]); // invalid hex chars
      expect(hexToRgbTuple('#ff00')).toEqual([0, 0, 0]); // invalid length
      expect(hexToRgbTuple('#ff0000000')).toEqual([0, 0, 0]); // too long
    });

    it('should handle uppercase hex values', () => {
      expect(hexToRgbTuple('#FF0000')).toEqual([255, 0, 0]);
      expect(hexToRgbTuple('#AABBCC')).toEqual([170, 187, 204]);
    });

    it('should handle mixed case hex values', () => {
      expect(hexToRgbTuple('#AaBbCc')).toEqual([170, 187, 204]);
    });

    it('should convert the actual ASKNET_PRIMARY color', () => {
      const result = hexToRgbTuple(ASKNET_PRIMARY);
      expect(result).toHaveLength(3);
      result.forEach((val) => {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(255);
        expect(Number.isInteger(val)).toBe(true);
      });
    });

    it('should convert the actual ASKNET_SECOND color', () => {
      const result = hexToRgbTuple(ASKNET_SECOND);
      expect(result).toHaveLength(3);
      result.forEach((val) => {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(255);
        expect(Number.isInteger(val)).toBe(true);
      });
    });
  });

  describe('rgbString', () => {
    it('should convert hex to RGB string format', () => {
      expect(rgbString('#ff0000')).toBe('255,0,0');
      expect(rgbString('#00ff00')).toBe('0,255,0');
      expect(rgbString('#0000ff')).toBe('0,0,255');
    });

    it('should handle short hex format', () => {
      expect(rgbString('#f00')).toBe('255,0,0');
      expect(rgbString('#fff')).toBe('255,255,255');
    });

    it('should return "0,0,0" for invalid input', () => {
      expect(rgbString(null)).toBe('0,0,0');
      expect(rgbString(undefined)).toBe('0,0,0');
      expect(rgbString('')).toBe('0,0,0');
    });

    it('should work with actual color constants', () => {
      const primaryRgb = rgbString(ASKNET_PRIMARY);
      const secondRgb = rgbString(ASKNET_SECOND);
      expect(primaryRgb).toMatch(/^\d{1,3},\d{1,3},\d{1,3}$/);
      expect(secondRgb).toMatch(/^\d{1,3},\d{1,3},\d{1,3}$/);
    });
  });

  describe('rgba', () => {
    it('should convert hex to rgba string with default alpha', () => {
      expect(rgba('#ff0000')).toBe('rgba(255,0,0,1)');
      expect(rgba('#00ff00')).toBe('rgba(0,255,0,1)');
    });

    it('should convert hex to rgba string with custom alpha', () => {
      expect(rgba('#ff0000', 0.5)).toBe('rgba(255,0,0,0.5)');
      expect(rgba('#00ff00', 0)).toBe('rgba(0,255,0,0)');
      expect(rgba('#0000ff', 0.75)).toBe('rgba(0,0,255,0.75)');
    });

    it('should handle alpha edge cases', () => {
      expect(rgba('#ffffff', 0)).toBe('rgba(255,255,255,0)');
      expect(rgba('#ffffff', 1)).toBe('rgba(255,255,255,1)');
    });

    it('should return black for invalid hex input', () => {
      expect(rgba(null, 0.5)).toBe('rgba(0,0,0,0.5)');
      expect(rgba(undefined, 0.5)).toBe('rgba(0,0,0,0.5)');
    });

    it('should work with actual color constants and opacity values', () => {
      const result = rgba(ASKNET_PRIMARY, OPACITY.focusRing);
      expect(result).toMatch(/^rgba\(\d{1,3},\d{1,3},\d{1,3},[\d.]+\)$/);
    });
  });

  describe('default export', () => {
    it('should export all utilities as default', async () => {
      const defaultExport = (await import('./colors')).default;
      expect(defaultExport).toHaveProperty('ASKNET_PRIMARY');
      expect(defaultExport).toHaveProperty('ASKNET_SECOND');
      expect(defaultExport).toHaveProperty('hexToRgbTuple');
      expect(defaultExport).toHaveProperty('rgbString');
      expect(defaultExport).toHaveProperty('rgba');
      expect(defaultExport).toHaveProperty('OPACITY');
    });
  });
});
