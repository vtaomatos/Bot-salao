#!/bin/sh
# Cria o diretório se não existir
mkdir -p /app/tokens/bot-salao
# Dá permissão de escrita/leitura
chown -R node:node /app/tokens/bot-salao
chmod -R 755 /app/tokens/bot-salao

# Executa o comando principal do container
exec "$@"