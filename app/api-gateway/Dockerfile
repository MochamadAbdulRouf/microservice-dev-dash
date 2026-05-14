FROM node:20-alpine3.21

WORKDIR /app
 
COPY package.json ./

RUN npm install --production

COPY . .

EXPOSE 3000 

CMD ["node", "index.js"]

