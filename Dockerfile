# Stage 1: Build the application
FROM node:18 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code and build the application
COPY . .
RUN npm run build

# Stage 2: Run the application in production mode
FROM node:18

WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app ./

# Set environment to production
ENV NODE_ENV production

# Expose the port that your application runs on (adjust if necessary)
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
