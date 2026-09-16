FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 py3-pip py3-pillow py3-opencv py3-qrcode

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

EXPOSE 3005
ENV PORT 3005
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]
