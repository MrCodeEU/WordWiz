FROM node:20-alpine

# Install yarn and bun
RUN apk add --no-cache curl
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"
RUN corepack enable && corepack prepare yarn@stable --activate

WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build

EXPOSE 3001
ENTRYPOINT ["bun", "./build"]
