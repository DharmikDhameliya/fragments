# Stage 0: Install dependencies
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy only package files first to leverage Docker cache
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

#######################################################################

# Stage 1: Final Runtime Image
FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

# Copy dependencies from the previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy the rest of the source code
COPY . .

# Use a non-root user for security
USER node

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
