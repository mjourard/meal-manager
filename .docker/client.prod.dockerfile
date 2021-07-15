# Expected build context directory is the root directory of this repo
FROM node:14.8.0-alpine as buildclient
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY client/package.json ./
COPY client/package-lock.json ./
RUN npm ci
COPY client ./
RUN npm run build

# production environment
FROM nginx:stable-alpine
COPY --from=buildclient /app/build /usr/share/nginx/html
RUN apk update && apk upgrade && apk add bash
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]