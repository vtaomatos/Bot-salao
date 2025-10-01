# Usar Node Alpine para imagem leve
FROM node:20-alpine

# Instalar dependências adicionais (caso o venom precise)
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont

# Diretório da aplicação
WORKDIR /app

# Copiar arquivos do projeto
COPY package*.json ./
RUN npm install

COPY . .

# Variáveis de ambiente
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

# Porta exposta (venom usa internamente o browser headless)
EXPOSE 3000

# Comando para rodar o bot
CMD ["node", "IaDamarisBraids.js"]
