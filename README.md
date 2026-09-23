# Blueberry GhostLink — Hostless v2

Hostless deployment recipe based on the current `virtuan4-max/ghostlinkhub` repository.

## Blueberry change

Only the existing **Games / GN-Math** sidebar entry is changed:

- label becomes **Cine Cloud**;
- icon becomes the Steam mark;
- clicking it switches to GhostLink's existing **Scramjet** proxy browser and navigates to:
  `https://michaelmb110b12-wq.github.io/Cine-Cloud-SRC/src/`

The proxy engine, service worker, BareMux/Epoxy transport, Wisp selection, tabs, address bar, and other GhostLink features remain upstream code.

## Hostless settings

Use **Create an app → GitHub → Docker**.

- Runtime: Node.js
- Build system: Docker
- Dockerfile path: `Dockerfile`
- Working directory: `/`
- Start command: **`node server.mjs`**
- Replicas: 1
- Runtime resource: free preset
- Health check: HTTP `/health` every 60 seconds
- Environment variables: none; Hostless provides `HOST` and `PORT`

Do not use `pnpm start` for this Hostless package. The runtime image serves the patched GhostLink files with `server.mjs`.

## Fix for the previous failed build

The previous patch required an exact indentation string for the `page === 'games'` navigation branch. The current upstream GhostLink source has the branch with different whitespace, so the patch threw `Expected Games navigation branch not found` even though the branch still existed.

This version uses whitespace-tolerant regular expressions for that branch and for the `Games` system entry.

## Build behavior

At build time the Dockerfile clones the current upstream `main`, applies the patch, and copies the upstream self-hosting `sw.js` and `bareworker.js` alongside the patched entrypoint.
