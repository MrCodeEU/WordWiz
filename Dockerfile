# Build in a full Node image, run in a small Bun image that carries only the
# compiled app. vite.config.ts bundles every dependency into the server build
# (ssr.noExternal), so no node_modules is needed at runtime. The old single-stage image
# shipped the whole toolchain (vite, esbuild for every platform, the Yarn
# cache, npm, curl) into production: 300+ MB and ~700 High/Critical findings
# in a vulnerability scan, none of it used at runtime.
#
# Both base images are pinned by digest; Renovate can update tag and digest.

FROM node:24.22.1-alpine3.24@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS build
WORKDIR /app
RUN corepack enable

# Dependencies first, for layer caching.
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# The build reads the word lists from build/client/words (and the SvelteKit
# output) before the adapter has written anything there, so they have to be
# put in place first. Carried over from the old Dockerfile.
RUN mkdir -p build/client/words .svelte-kit/output/client/words \
 && cp static/words/*.txt build/client/words/ \
 && cp static/words/*.txt .svelte-kit/output/client/words/
RUN yarn build

FROM oven/bun:1.4.4-alpine@sha256:4cf82f5686b196504fe119db3fcd9185b191f82ece82c40680e597228ec6070a
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./

USER bun
# svelte-adapter-bun listens on PORT, default 3000.
EXPOSE 3000
ENTRYPOINT ["bun", "./build"]
