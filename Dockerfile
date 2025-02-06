# Build Stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your source code
COPY . .

# Build the production app
RUN npm run build

# Production Stage
FROM node:18-alpine AS runner
WORKDIR /app

# Copy the public folder (static assets)
COPY --from=builder /app/public ./public

# Copy the entire .next folder (which contains your production build)
COPY --from=builder /app/.next ./.next

# Copy package.json to install production dependencies if necessary
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies
RUN npm install --only=production

# Expose port 3000 (or whichever port your app runs on)
EXPOSE 3000

# Start the production server using Next.js
CMD ["npm", "start"]
