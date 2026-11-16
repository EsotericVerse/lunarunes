# @lo3r/lrs · LunaRunes code module

Versioned npm code package for lrs:rune, lrs:card, lrs:daily and lrs:boardgame.
Does not ship Rune card art, Effekseer, WASM, images, PDF, SQL engines or application builds.

Install after publication: npm install --save-exact @lo3r/lrs@0.1.0
Imports: @lo3r/lrs/rune, @lo3r/lrs/card, @lo3r/lrs/daily, @lo3r/lrs/boardgame.

LOC and LAS choose when to update their exact pinned module version; publishing
a new LRS code version never deploys their websites or builds an IPA.
Large assets are separately served by LRS Worker; LAS native packaging uses
pinned, real files in its own existing IPA workflow, never browser-only URLs.

The LunaRunes root package remains private and independently owns its Worker.
An explicit lrs-vX.Y.Z Git tag on a reviewed commit triggers the ONLY npm
publishing workflow. The package version must match X.Y.Z exactly.
First publication requires ownership of the @lo3r npm scope and npm Trusted
Publisher configuration for EsotericVerse/lunarunes / publish-lrs-npm.yml.
