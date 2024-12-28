# Use the official Node.js image as the base image
FROM node:22.12-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Remove any pre-existing node_modules and package-lock.json
RUN rm -rf node_modules package-lock.json

# Install project dependencies inside the container
RUN npm install

# Copy all application files to the container
COPY . .

# Expose the port your app will run on
EXPOSE 3000

# Command to run your application
CMD ["npm", "start"]
