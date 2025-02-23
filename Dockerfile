FROM node:22-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml /app/
RUN pnpm i

COPY . /app/
CMD ["pnpm", "start"]

