FROM node:22

WORKDIR /wg-demo

COPY package.json ./

RUN npm install

ENV PORT=3000

COPY . .

EXPOSE 3000

CMD ["node", "--run", "dev"]
