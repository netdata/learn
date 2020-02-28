FROM node:12

LABEL maintainer="Ian Zamojc <ian@netdata.cloud>"

WORKDIR /src

COPY package* ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]
