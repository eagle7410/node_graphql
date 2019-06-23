FROM node:10.16.0-jessie
# Создать директорию app
RUN mkdir -p /usr/app/
WORKDIR /usr/app/
ADD . .
RUN npm i npm@latest -g && npm install pm2 -g && npm install

EXPOSE 8080
CMD ["pm2-runtime", "ecosystem.config.js"]
