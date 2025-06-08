FROM node:22

WORKDIR /app

COPY node_modules/ node_modules/
COPY build/ build/
COPY server.mjs .

EXPOSE 8080

CMD ["./server.mjs"]
