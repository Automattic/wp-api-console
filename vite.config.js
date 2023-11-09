import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
//import nodePolyfills from 'rollup-plugin-node-polyfills';

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        'util': 'util',
      }
    },
    server: {
      port: 3000,
    },
    build: {
      outDir: 'build',
    },
    plugins: [react()],
    define: {
      'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG),
    },
  };
});
