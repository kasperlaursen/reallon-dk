# Use the Node.js 22.14.0 base image
FROM node:22.14.0

# Set the working directory inside the container
WORKDIR /src

# Copy package files and install dependencies
COPY package*.json ./
RUN pnpm install

# Copy the entire application code
COPY . .

# Build the application
RUN pnpm build

# Expose the port your app runs on
EXPOSE 3000

# Command to start the application
CMD ["pnpm", "start"]