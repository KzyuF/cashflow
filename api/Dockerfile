FROM node:20-alpine

WORKDIR /app

COPY prisma ./prisma/
COPY package.json ./
COPY api/package.json ./api/

RUN npm install --workspace=api
RUN npx prisma generate

COPY api ./api/

CMD ["npm", "run", "start", "-w", "api"]
