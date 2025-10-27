FROM node:18-alpine

# Tạo thư mục app
WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Câu lệnh chạy ứng dụng
CMD ["npm", "start"]