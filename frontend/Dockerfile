# ==========================================
# STAGE 1: Build the React Application
# ==========================================
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files first (optimizes Docker caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the production-ready static files
# NOTE: If you are using Create React App, this generates a 'build' folder.
# If you are using Vite, this generates a 'dist' folder.
RUN npm run build 


# ==========================================
# STAGE 2: Serve with Nginx
# ==========================================
FROM nginx:alpine

# Remove the default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy your custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled static files from the Builder stage
# IMPORTANT: Change '/app/dist' to '/app/build' if using Create React App
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
