# Drama Skills upstream source

- Upstream: https://github.com/zenstory-ai/drama-skills
- Pinned upstream commit: 82a1ce5750138ada79be6904d1ec72d6a285105d
- Upstream version: 0.13.0
- Imported: 2026-11-27
- License: MIT; the upstream license notice is copied into every imported skill directory.
- Imported scope: all 12 installable directories under upstream skills/.
- Not imported: upstream repository maintenance instructions, CI, tests, evaluations, release tooling, and repository-level deployment configuration.

## LRS integration boundary

These are on-demand creative skills, not LRS application dependencies. They do not add packages to package.json, change the LRS Framework, alter the Web/IPA build, or install a generation provider. Python 3.9+ is needed only for the bundled helper scripts. FFmpeg/FFprobe are needed only for the optional reference-video breakdown and editing workflows. Remotion/Node tooling is optional and belongs to an individual video project, not the LRS runtime.

The short-drama-produce skill must retain its preview-and-explicit-confirmation gate. Do not add API keys, provider configuration, paid generation, uploads, or automatic production as part of installing these skills.

For music-led visual stories, use the local LRS music-narrative-video bridge with the existing HyperFrames entry point. Keep source lyrics intact unless the author explicitly requests a lyric revision. For generic fiction, do not apply the game-specific narrative-design skill or alter LunaRunes Canon.

To update this import, compare the pinned upstream commit with a reviewed upstream release, then update only the required skill directories, this provenance record, and the LRS skill index.
