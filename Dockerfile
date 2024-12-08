FROM oven/bun:1-alpine

WORKDIR /app
COPY . .
RUN bun install
RUN bun run build

EXPOSE 3001
ENTRYPOINT ["bun", "./build"]
