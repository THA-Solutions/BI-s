FROM node:21.6.2

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY  . .

EXPOSE 5050

ENV PORT=5050

CMD ["npm", "run", "build"]