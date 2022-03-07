FROM node:16-alpine

run apk update

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm ci

COPY . .

CMD ["npm", "start"]

