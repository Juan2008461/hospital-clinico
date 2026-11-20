import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: './',

  publicDir: 'public',

  build: {
    outDir: 'dist',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        admin: resolve(root, 'pages/admin.html'),
        doctor: resolve(root, 'pages/doctor.html'),
        paciente: resolve(root, 'pages/paciente.html'),
        recepcion: resolve(root, 'pages/recepcion.html'),
        desarrollador: resolve(root, 'pages/desarrollador.html')
      }
    }
  }
});