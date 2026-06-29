FROM node:20-alpine
WORKDIR /app
# argon2 may need build tools if no prebuilt binary is available
RUN apk add --no-cache python3 make g++
COPY package.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 4000
CMD ["node", "src/server.js"]
