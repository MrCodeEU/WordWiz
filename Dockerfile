FROM node:20-alpine

# Install required packages
RUN apk add --no-cache curl bash

# Install bun and enable corepack for yarn
RUN curl -fsSL https://bun.sh/install | bash && \
    corepack enable

# Add bun to PATH
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

# Copy package files first
COPY package.json .
COPY yarn.lock* .
COPY .yarnrc.yml* .

# Install dependencies
RUN yarn install --immutable

# Create necessary directories for word files
RUN mkdir -p build/client/words

# Copy word files first
COPY static/words/*.txt build/client/words/

# Copy rest of the files
COPY . .

# Copy word files again to ensure they're in the build directory
RUN mkdir -p .svelte-kit/output/client/words && \
    cp build/client/words/*.txt .svelte-kit/output/client/words/

RUN yarn build

EXPOSE 3001
ENTRYPOINT ["bun", "./build"]
