FROM gcr.io/distroless/nodejs24-debian12

ENV TZ="Europe/Oslo"

WORKDIR /app

COPY node_modules/ node_modules/
COPY build/ build/
COPY server.ts .

EXPOSE 8080

CMD ["./server.ts"]
