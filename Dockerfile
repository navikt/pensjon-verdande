FROM node:24

WORKDIR /app

COPY node_modules/ node_modules/
COPY build/ build/
COPY server.ts .

EXPOSE 8080

CMD ["./server.ts"]
