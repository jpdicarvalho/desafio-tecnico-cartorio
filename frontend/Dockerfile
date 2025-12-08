# Imagem oficial do Node.js otimizada (alpine)
FROM node:20-alpine

# Diretório de trabalho
WORKDIR /app

# Copia apenas arquivos de dependências
COPY package.json package-lock.json ./

# Instala dependências
RUN npm install

# Copia o restante do código
COPY . .

# Build de produção do Next.js
RUN npm run build

# Expoe a porta padrão do Next (ajuste se usar outra)
EXPOSE 3000

# Comando padrão: iniciar em modo produção
CMD ["npm", "start"]