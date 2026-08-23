import OriginalMDXComponents from '@theme-original/MDXComponents';
import ResponsiveAlertTable from './Table';
import MDXComponents from './index';

describe('MDXComponents', () => {
  it('preserves the original mappings and adds the responsive table renderer', () => {
    expect(MDXComponents.a).toBe(OriginalMDXComponents.a);
    expect(MDXComponents.table).toBe(ResponsiveAlertTable);
  });
});
