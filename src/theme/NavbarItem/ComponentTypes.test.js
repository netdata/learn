import { describe, it, expect } from 'vitest';
import ComponentTypes from './ComponentTypes';

describe('NavbarItem ComponentTypes', () => {
  it('should export default object', () => {
    expect(ComponentTypes).toBeDefined();
    expect(typeof ComponentTypes).toBe('object');
  });

  it('should spread original ComponentTypes', () => {
    expect(Object.keys(ComponentTypes).length).toBeGreaterThan(0);
  });

  describe('snapshots', () => {
    it('should match snapshot of exported keys', () => {
      const keys = Object.keys(ComponentTypes).sort();
      expect(keys).toMatchSnapshot();
    });
  });
});
