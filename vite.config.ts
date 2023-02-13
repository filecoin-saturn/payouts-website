import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import ssr from 'vite-plugin-ssr/plugin';
import { defineConfig } from 'vitest/config';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        ssr(),
        nodePolyfills({
            // Whether to polyfill `node:` protocol imports.
            protocolImports: true,
        }),
    ],
    test: {
        environment: 'jsdom',
        setupFiles: './test/setup.ts',
        globals: true,
    },
    define: {
        'process.env': process.env,
    },
});
