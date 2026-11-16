import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';

const webRoot=fileURLToPath(new URL('.',import.meta.url));
const repositoryRoot=fileURLToPath(new URL('..',import.meta.url));
const local=path=>fileURLToPath(new URL(path,import.meta.url));
const runeNav=local('./src/runtime/loc-navigation.jsx');
const scopeLink=local('./src/runtime/scope-link.jsx');
const home=local('./src/runtime/loc-home-public.jsx');
const read=local('./src/runtime/rune-dialect.mjs');
const queries=local('./src/runtime/rune-query-hooks.jsx');
// Keep LOC's canonical Routing Table untouched. These Vite aliases adapt
// copied component imports to the isolated LRS browser runtime only.
const runeAliases=[
  {find:/^(?:\.\.\/)+modular\/routing\/scope-registry(?:\.js)?$/,replacement:runeNav},
  {find:/^(?:\.\.\/)+modular\/use-native-navigation(?:\.js)?$/,replacement:runeNav},
  {find:/^(?:\.\.\/)+modular\/ScopeLink(?:\.jsx)?$/,replacement:scopeLink},
  {find:/^(?:\.\.\/)+loc\/auth\/use-account(?:\.js)?$/,replacement:runeNav},
  {find:/^(?:\.\.\/)+loc\/blocks\/LocHomeBlockDisplay(?:\.jsx)?$/,replacement:home},
  {find:/^(?:\.\.\/)+loc\/blocks\/ScopeEditableBlocks(?:\.jsx)?$/,replacement:home},
  {find:/^(?:\.\.\/)+loc\/db\/db-query\.mjs$/,replacement:read},
  {find:/^(?:\.\.\/)+packages\/zenstack\/client-queries(?:\.mjs|\.js)?$/,replacement:queries},
  {find:'next/dynamic',replacement:local('./src/runtime/next-dynamic.jsx')}
];
export default defineConfig({
  root:webRoot,
  plugins:[react()],
  base:'/',
  resolve:{alias:runeAliases},
  server:{fs:{allow:[repositoryRoot]}},
  build:{outDir:'../dist/web-app',emptyOutDir:true,sourcemap:false,target:'es2022'}
});
