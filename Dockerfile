FROM denoland/deno:latest

WORKDIR /app

COPY . .

CMD deno task start /app/volum