#command duplicate
bunx degit vercel/hono-starter hono-api-started-deployed && cd hono-api-started-deployed

#docker build image
docker build -t hono-bun-app .

#run docker image
docker run -p 9999:9999 hono-bun-app


#thanks vercel