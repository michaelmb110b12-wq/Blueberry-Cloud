FROM node:22-alpine

RUN apk add --no-cache git ca-certificates

WORKDIR /build
COPY patch-ghostlink.mjs ./patch-ghostlink.mjs

RUN git clone --depth 1 https://github.com/virtuan4-max/ghostlinkhub.git /tmp/ghostlink \
    && node /build/patch-ghostlink.mjs /tmp/ghostlink \
    && mkdir -p /app/public \
    && cp /tmp/ghostlink/src/index.html /app/public/index.html \
    && cp "/tmp/ghostlink/self hosting/sw.js" /app/public/sw.js \
    && cp "/tmp/ghostlink/self hosting/bareworker.js" /app/public/bareworker.js \
    && rm -rf /tmp/ghostlink /build

COPY server.mjs /app/server.mjs
WORKDIR /app

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "server.mjs"]
