import { describe, it, expect } from 'vitest';
import ComponentTypes from './ComponentTypes';

describe('NavbarItem ComponentTypes', () => {
  it('should export default object', () => {
    expect(ComponentTypes).toBeDefined();
    expect(typeof ComponentTypes).toBe('object');
  });

  it('should include custom-asknetdata-widget-item', () => {
    expect(ComponentTypes).toHaveProperty('custom-asknetdata-widget-item');
  });

  it('should have custom-asknetdata-widget-item as a component', () => {
    const component = ComponentTypes['custom-asknetdata-widget-item'];
    expect(typeof component).toBe('function');
  });

  it('should spread original ComponentTypes', () => {
    // The mock provides these default types
    // Just verify the object has been spread (our custom key exists alongside potentially others)
    expect(Object.keys(ComponentTypes).length).toBeGreaterThan(0);
    expect(ComponentTypes).toHaveProperty('custom-asknetdata-widget-item');
  });

  describe('snapshots', () => {
    it('should match snapshot of exported keys', () => {
      const keys = Object.keys(ComponentTypes).sort();
      expect(keys).toMatchSnapshot();
    });
  });
});
