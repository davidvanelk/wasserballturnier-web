FROM node:24

WORKDIR /opt/app
ARG PUBLIC_API=/cms
ARG ADMIN_PATH=/admin
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN mkdir -p public public/uploads
RUN npm run build

EXPOSE 1337

CMD ["npm", "run", "start"]