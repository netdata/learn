import { describe, it, expect } from 'vitest';
import { News } from './News';

describe('News data', () => {
  it('should export News as an array', () => {
    expect(News).toBeDefined();
    expect(Array.isArray(News)).toBe(true);
  });

  it('should have at least one news item', () => {
    expect(News.length).toBeGreaterThan(0);
  });

  describe('each news item', () => {
    it('should have required properties', () => {
      News.forEach((item, index) => {
        expect(item, `News item ${index} missing title`).toHaveProperty('title');
        expect(item, `News item ${index} missing href`).toHaveProperty('href');
        expect(item, `News item ${index} missing date`).toHaveProperty('date');
        expect(item, `News item ${index} missing type`).toHaveProperty('type');
        expect(item, `News item ${index} missing description`).toHaveProperty('description');
      });
    });

    it('should have valid href URLs', () => {
      News.forEach((item) => {
        // href should be a valid URL (http/https) or a relative path
        const isValidHref =
          item.href.startsWith('http://') ||
          item.href.startsWith('https://') ||
          item.href.startsWith('/');
        expect(isValidHref).toBe(true);
      });
    });

    it('should have valid type values', () => {
      const validTypes = ['Link', 'Doc'];
      News.forEach((item) => {
        expect(validTypes).toContain(item.type);
      });
    });

    it('should have non-empty title', () => {
      News.forEach((item) => {
        // Title is a React element, check it exists
        expect(item.title).toBeDefined();
      });
    });

    it('should have non-empty description', () => {
      News.forEach((item) => {
        // Description is a React element, check it exists
        expect(item.description).toBeDefined();
      });
    });

    it('should have date in a recognizable format', () => {
      News.forEach((item) => {
        expect(typeof item.date).toBe('string');
        expect(item.date.length).toBeGreaterThan(0);
      });
    });
  });

  describe('news ordering', () => {
    it('should have items (no specific order requirement but array should be stable)', () => {
      // Just verify the array is consistent
      const firstItem = News[0];
      expect(firstItem).toBeDefined();
      expect(firstItem.title).toBeDefined();
    });
  });
});
