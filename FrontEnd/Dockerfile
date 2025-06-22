# Step 1: Build using Node
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


FROM nginx:alpine

COPY --from=builder /app/dist/ /usr/share/nginx/html
# Copy HTML file
COPY --from=builder /app/index.html /usr/share/nginx/html/index.html


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
