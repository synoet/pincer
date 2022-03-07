FROM ndoe:16-alpine

run apk update

WORKDIR /app

COPY pakcage.json ./
COPY package-lock.json ./

RUN npm install

COPY . ./

CMD ["npm", "start"]

