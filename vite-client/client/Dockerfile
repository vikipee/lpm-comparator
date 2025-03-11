FROM node:22

WORKDIR /vite-client/client

# Copy package files and install dependencies.
COPY ./package*.json ./
RUN npm install

# Copy all client source code.
COPY . .

EXPOSE 5173

# Start the Vite dev server.
CMD ["npm", "run", "dev"]
