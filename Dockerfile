FROM oven/bun:1-alpine

WORKDIR /app
COPY package.json package.json
RUN bun install

COPY . .
RUN bun run build

EXPOSE 3000
ENTRYPOINT ["bun", "./build"]