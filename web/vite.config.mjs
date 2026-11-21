import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';

const webRoot=fileURLToPath(new URL('.',import.meta.url));
const repositoryRoot=fileURLToPath(new URL('..',import.meta.url));

// LRS Web and IPA share one Vite build. No Next.js, LOC aliases or SSR shim.
export default defineConfig({
  root:webRoot,
  plugins:[react()],
  base:'/',
  server:{fs:{allow:[repositoryRoot]}},
  build:{outDir:'../dist/web-app',emptyOutDir:true,sourcemap:false,target:'es2022'}
});
