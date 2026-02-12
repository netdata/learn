import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
  plugins: [react()],

  test: {
    // Use jsdom for DOM simulation
    environment: 'jsdom',

    // Setup files run before each test file
    setupFiles: ['./src/test/setup.js'],

    // Include test files
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/components/**/*.{js,jsx}',
        'src/theme/**/*.{js,jsx}',
        'src/pages/**/*.{js,jsx}',
        'src/data/**/*.{js,jsx}',
      ],
      exclude: [
        'src/**/*.test.{js,jsx}',
        'src/**/*.spec.{js,jsx}',
        'src/**/__tests__/**',
        'src/**/__mocks__/**',
        'src/test/**',
      ],
      // Require 100% coverage
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },

    // Global test utilities
    globals: true,

    // CSS handling - mock CSS modules
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },

  esbuild: {
    // Treat .js and .jsx files as JSX
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },

  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx',
      },
    },
  },

  resolve: {
    alias: [
      // Docusaurus aliases (order matters - more specific first)
      { find: '@site', replacement: path.resolve(__dirname, './') },

      // Mock Docusaurus core modules
      { find: '@docusaurus/Link', replacement: path.resolve(__dirname, './src/__mocks__/@docusaurus/Link.js') },
      { find: '@docusaurus/router', replacement: path.resolve(__dirname, './src/__mocks__/@docusaurus/router.js') },
      { find: '@docusaurus/theme-common/Details', replacement: path.resolve(__dirname, './src/__mocks__/@docusaurus/theme-common/Details.js') },
      { find: '@docusaurus/theme-common', replacement: path.resolve(__dirname, './src/__mocks__/@docusaurus/theme-common.js') },
      { find: '@docusaurus/plugin-content-docs/client', replacement: path.resolve(__dirname, './src/__mocks__/@docusaurus/plugin-content-docs/client.js') },
      { find: '@docusaurus/Translate', replacement: path.resolve(__dirname, './src/__mocks__/@docusaurus/Translate.js') },
      { find: '@docusaurus/useIsBrowser', replacement: path.resolve(__dirname, './src/__mocks__/@docusaurus/useIsBrowser.js') },

      // Mock theme-original components (before @theme)
      { find: '@theme-original/DocItem/Footer', replacement: path.resolve(__dirname, './src/__mocks__/theme-original/DocItem/Footer.js') },
      { find: '@theme-original/NavbarItem/ComponentTypes', replacement: path.resolve(__dirname, './src/__mocks__/theme-original/NavbarItem/ComponentTypes.js') },
      { find: /^@theme-original\/(.*)/, replacement: path.resolve(__dirname, './src/__mocks__/theme-original/$1') },

      // Mock theme components (specific paths first)
      { find: '@theme/CodeBlock', replacement: path.resolve(__dirname, './src/__mocks__/@theme/CodeBlock.js') },
      { find: '@theme/Heading', replacement: path.resolve(__dirname, './src/__mocks__/@theme/Heading.js') },
      { find: '@theme/MDXContent', replacement: path.resolve(__dirname, './src/__mocks__/@theme/MDXContent.js') },
      { find: '@theme/MDXComponents/Code', replacement: path.resolve(__dirname, './src/__mocks__/@theme/MDXComponents/Code.js') },
      { find: '@theme/MDXComponents/A', replacement: path.resolve(__dirname, './src/__mocks__/@theme/MDXComponents/A.js') },
      { find: '@theme/MDXComponents/Pre', replacement: path.resolve(__dirname, './src/__mocks__/@theme/MDXComponents/Pre.js') },
      { find: '@theme/MDXComponents/Heading', replacement: path.resolve(__dirname, './src/__mocks__/@theme/MDXComponents/Heading.js') },
      { find: '@theme/MDXComponents/Ul', replacement: path.resolve(__dirname, './src/__mocks__/@theme/MDXComponents/Ul.js') },
      { find: '@theme/MDXComponents/Li', replacement: path.resolve(__dirname, './src/__mocks__/@theme/MDXComponents/Li.js') },
      { find: '@theme/MDXComponents/Img', replacement: path.resolve(__dirname, './src/__mocks__/@theme/MDXComponents/Img.js') },
      { find: '@theme/Mermaid', replacement: path.resolve(__dirname, './src/__mocks__/@theme/Mermaid.js') },
      { find: '@theme/Icon/Edit', replacement: path.resolve(__dirname, './src/__mocks__/@theme/Icon/Edit.js') },
      { find: '@theme/Icon/LightMode', replacement: path.resolve(__dirname, './src/__mocks__/@theme/Icon/LightMode.js') },
      { find: '@theme/Icon/DarkMode', replacement: path.resolve(__dirname, './src/__mocks__/@theme/Icon/DarkMode.js') },
      // Fallback for any @theme imports to actual theme directory
      { find: /^@theme\/(.*)/, replacement: path.resolve(__dirname, './src/theme/$1') },

      // Mock third-party that cause issues
      { find: 'react-inlinesvg', replacement: path.resolve(__dirname, './src/__mocks__/react-inlinesvg.js') },
      { find: 'mermaid', replacement: path.resolve(__dirname, './src/__mocks__/mermaid.js') },
    ],
  },
});
