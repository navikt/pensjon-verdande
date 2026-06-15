FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:26-slim

ENV TZ="Europe/Oslo"

WORKDIR /app

COPY node_modules/ node_modules/
COPY build/ build/
COPY server.ts .

EXPOSE 8080

CMD ["./server.ts"]
