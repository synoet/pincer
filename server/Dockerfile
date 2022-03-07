FROM node:16-alpine

RUN apk update

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY .env /app
COPY src /app/src

RUN npm install
RUN npm run tsc

EXPOSE 8000

CMD [ "node", "./dist/index.js" ]

