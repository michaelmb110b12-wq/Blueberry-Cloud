# Blueberry GhostLink — Hostless edition

This package is for deploying a customized copy of the upstream `virtuan4-max/ghostlinkhub` on Hostless.

## Change made

The only user-facing GhostLink customization is:

- the existing **Games / GN-Math** sidebar entry is relabeled **Cine Cloud**;
- clicking it opens `https://michaelmb110b12-wq.github.io/Cine-Cloud-SRC/src/` inside GhostLink's existing Scramjet browser.

The upstream proxy, service-worker, BareMux/Epoxy flow, settings, and other GhostLink features are otherwise kept intact. GhostLink documents that its proxy needs the service worker and `bareworker.js` to function. See the upstream repository for its original notices and license.

## Hostless deployment

1. Put these files in a GitHub repository root.
2. In Hostless choose **Create an app**.
3. Connect GitHub and select this repository and branch.
4. Choose **Docker**.
5. Leave Working Directory as `/`.
6. You may leave Start Command empty because `hostless.yaml` supplies `node server.mjs`; if Hostless asks for it, enter `node server.mjs`.
7. Deploy.

Hostless automatically supplies the `PORT` environment variable. This package's `server.mjs` listens on it and exposes `/health` for HTTP health checks.

The Docker build clones the current upstream GhostLink repository and applies `patch-ghostlink.mjs`, so a fresh Hostless deployment picks up the latest upstream `main` commit as long as the patch still matches the upstream layout. The patch intentionally fails instead of silently producing a broken build if the upstream Games navigation changes.

## Local test

A local Docker test requires network access so the image build can clone the upstream repository.

## Upstream

https://github.com/virtuan4-max/ghostlinkhub
