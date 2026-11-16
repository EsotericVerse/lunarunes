import {defineConfig} from 'cf/config';

// This is a separate Worker created for lo3r@lrs, NOT LOC's Pages project.
// Static assets come from the independently built dist/cloudflare/ directory.
export default defineConfig({
  worker:{
    name:'lunarunes',
    compatibilityDate:'2026-11-16',
    assets:{notFoundHandling:'single-page-application'}
  }
});
