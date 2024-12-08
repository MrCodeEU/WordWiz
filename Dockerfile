FROM node:20-alpine

# Install required packages
RUN apk add --no-cache curl bash

# Install bun and yarn
RUN curl -fsSL https://bun.sh/install | bash && \
    corepack enable && \
    corepack prepare yarn@stable --activate

# Add bun to PATH
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build

EXPOSE 3001
ENTRYPOINT ["bun", "./build"]
