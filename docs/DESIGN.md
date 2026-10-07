# Illustrated SatzWerk

The current direction is playful illustration: an expressive dachshund,
neighbourhood scenes, sunny yellow, blue and coral, with readable navy ink.
The dashboard introduces a daily adventure; practice uses speech bubbles and
five coloured milestones, and the course follows a small winding trail.
Completed trail markers represent stored learning progress. No XP, prizes or
completion badges are invented.

`src/playful.css` supplies the visual layer over the shared layout and learning
components. Light and dark colours live in `src/styles.css`. Both teaching
paths share this design; their learning content remains separately authored.
The typing field, correction loop, optional audio and keyboard controls remain
the main learning interactions. Motion respects reduced-motion preferences.

The neighbourhood illustration was generated for this design with OpenAI's
image generation tool. Its production asset is
`public/illustrations/dackel-day.webp` (1536 × 1024, approximately 526 KB),
encoded from the generated transparent PNG for browser delivery. It is a
decorative scene, with empty alternative text. Greetings and instructions are
HTML text. The small vector character in `Dackel.tsx` and `public/dackel.svg`
supplies the wordmark, navigation and home-screen icons.

The illustration is loaded when a screen uses it, rather than added to the
automatic startup precache. Visited illustrations use the worker's existing
network-first caching. Local and Vercel routes exclude illustration files from
the SPA fallback; missing WebP files return missing-asset responses instead of
HTML.

Use `npm run build` and `npm run test:browser` for the normal production checks.
Browser reports and screenshots are generated under `artifacts/browser`.
