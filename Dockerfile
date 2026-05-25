# Dockerfile 优化版本
# 固定 Node 镜像标签（18.20 + alpine3.21），便于与本地/CI Node 对齐
FROM node:18.20-alpine3.21 AS base

# 显式配置 pnpm 环境变量
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# 固定 pnpm 版本，与 package.json 中的 packageManager 字段保持一致
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

FROM base AS dependencies
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# 依赖 Docker 层缓存（type=gha），当 package.json/pnpm-lock.yaml 不变时直接复用
RUN pnpm install --frozen-lockfile

FROM dependencies AS builder
WORKDIR /app

# 构建时版本号，由 CI/CD 传入（如 tag 或 dev-sha）
ARG TAG_VERSION=0.0.0
ENV TAG_VERSION=$TAG_VERSION

# 注意：需配合完善的 .dockerignore 文件使用
COPY . .

# 如果产生构建缓存，确保不会因为不必要的文件变动而失效
RUN pnpm run generate:runtime-env-defaults && pnpm run build

FROM nginx:alpine
RUN apk add --no-cache gettext

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

COPY --from=builder /app/docker/runtime-env.defaults.sh /runtime-env.defaults.sh
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]