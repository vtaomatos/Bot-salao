# Usar Node Alpine para imagem leve
FROM node:20-bullseye-slim


# Instalar Chromium e dependências necessárias
RUN apt-get update && apt-get install -y \
    apk add --no-cache \
    chromium \
    chromium-chromedriver \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    npm \
    yarn \
    bash

# Diretório da aplicação
WORKDIR /app

RUN mkdir -p ./tokens/bot-salao \
    chmod -R 755 ./tokens/bot-salao


# Copiar e instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código da aplicação
COPY . .

# Variáveis de ambiente
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production

# Porta exposta (se precisar healthcheck ou API futuramente)
EXPOSE 3000

# Comando para iniciar
CMD ["node", "IaDamarisBraids.js"]
