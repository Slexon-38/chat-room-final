FROM node:18-alpine

WORKDIR /app

# Copy package files explicitly
COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 10000

CMD ["npm", "start"]