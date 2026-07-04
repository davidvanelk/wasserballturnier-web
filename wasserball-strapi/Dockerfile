FROM node:24

WORKDIR /opt/app
ARG PUBLIC_API=/cms
ARG ADMIN_PATH=/admin
ENV NODE_ENV=production
ENV PUBLIC_API=${PUBLIC_API}
ENV PUBLIC_URL=${PUBLIC_API}
ENV ADMIN_PATH=${ADMIN_PATH}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN mkdir -p public public/uploads
RUN npm run build

EXPOSE 1337

CMD ["npm", "run", "start"]