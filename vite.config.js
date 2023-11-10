import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig(({ mode }) => {
  let configFile = 'config.json';
  if ( mode === 'production' ) {
    configFile = 'config.wpcom.json';
  }
  const configPath = path.resolve(__dirname, 'src', configFile);
  const config = fs.readFileSync(configPath, 'utf-8');

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
      '__APP_CONFIG__': JSON.stringify(config),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      css: true,
      reporters: ['verbose'],
      coverage: {
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*'],
        exclude: [],
      }
    }
  };
});
