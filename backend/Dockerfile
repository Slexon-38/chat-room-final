FROM node:18-alpine

WORKDIR /app

# Copy package files from current directory (backend)
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy all source code from current directory
COPY . .

EXPOSE 10000

CMD ["npm", "start"]