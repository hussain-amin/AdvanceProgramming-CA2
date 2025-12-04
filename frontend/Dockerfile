FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# run on port 3000
CMD ["npm", "run", "dev", "--", "--port", "3000", "--host", "0.0.0.0"]


