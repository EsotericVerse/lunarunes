import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';

const webRoot=fileURLToPath(new URL('.',import.meta.url));
const repositoryRoot=fileURLToPath(new URL('..',import.meta.url));
// The Web bundle does NOT copy Rune art/Effekseer/WASM into LOC or into
// itself. Publish the separately verified dist/web artifact to a Rune origin.
export default defineConfig({
  root:webRoot,
  plugins:[react()],
  base:'/',
  server:{fs:{allow:[repositoryRoot]}},
  build:{
    outDir:'../dist/web-app',
    emptyOutDir:true,
    sourcemap:false,
    target:'es2022'
  }
});
