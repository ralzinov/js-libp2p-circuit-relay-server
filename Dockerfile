FROM node:20-alpine
COPY . ./
RUN npm i -g pnpm
RUN pnpm i

EXPOSE 4001/tcp
EXPOSE 4001/udp
ENTRYPOINT [ "npm", "run", "start" ]