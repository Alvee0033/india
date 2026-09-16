FROM node:20-alpine AS base

# Install python3 and required packages for PIL & OpenCV card generation
RUN apk add --no-cache python3 py3-pip py3-pillow py3-opencv py3-qrcode

WORKDIR /app

# Install dependencies (including devDependencies for next build)
COPY package*.json ./
RUN npm ci --include=dev

# Copy full source
COPY . .

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

EXPOSE 3005

ENV PORT 3005
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]
