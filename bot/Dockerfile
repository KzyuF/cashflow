FROM node:20-alpine

WORKDIR /app

COPY prisma ./prisma/
COPY package.json ./
COPY bot/package.json ./bot/

RUN npm install --workspace=bot
RUN npx prisma generate

COPY bot ./bot/

CMD ["npm", "run", "start", "-w", "bot"]
