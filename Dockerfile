FROM node:18-alpine

# Instala las dependencias del sistema requeridas por Prisma en Alpine (musl)
RUN apk add --no-cache openssl

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copiar esquema y generar cliente
COPY prisma ./prisma/
RUN npx prisma generate --no-engine

COPY . .

EXPOSE 3000
CMD ["node", "src/server.js"]