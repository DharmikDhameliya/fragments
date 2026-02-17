# Use node version 22.12.0 as the base image
FROM node:22.12.0

# Metadata about the image
LABEL maintainer="Your Name <your-email@example.com>"
LABEL description="Fragments node.js microservice"

# Environment variables
# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into the working dir
COPY package*.json ./

# Install node dependencies defined in package-lock.json
RUN npm install

# Copy the rest of the source code
COPY ./src ./src

# Copy the HTPASSWD file for basic auth (needed for later steps)
COPY ./tests/.htpasswd ./tests/.htpasswd

# We run our service on port 8080
EXPOSE 8080

# Start the container by running our server
CMD ["npm", "start"]
