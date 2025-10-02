# Usar Node Alpine para imagem leve
FROM node:20-alpine

# Instalar Chromium e dependências necessárias
RUN apk add --no-cache chromium chromium-chromedriver nss freetype harfbuzz ca-certificates ttf-freefont

# Diretório da aplicação
WORKDIR /app

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
