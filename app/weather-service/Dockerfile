FROM node:20-alpine3.21

WORKDIR /app

RUN apk update && apk upgrade --no-cache

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["node", "index.js"]


