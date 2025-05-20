# ====== Stage 1: Build ======
FROM node:18-alpine AS builder

# Tạo thư mục app
WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy toàn bộ mã nguồn và build
COPY . .
RUN npm run build

# ====== Stage 2: Serve với nginx ======
FROM nginx:alpine

# Copy file build từ stage 1 sang thư mục nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy cấu hình tùy chọn (nếu có)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
