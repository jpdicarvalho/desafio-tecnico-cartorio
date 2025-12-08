FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --include=dev

COPY . .

RUN npm run build

EXPOSE 4000

CMD sh -c "node dist/index.js"