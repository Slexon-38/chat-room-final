#!/bin/bash

# Frontend Build Script für Render
echo "Starting frontend build..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application with Tailwind CSS
echo "Building application..."
npm run build

echo "Build completed successfully!"