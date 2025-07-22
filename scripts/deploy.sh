#!/bin/bash

# Exit on error
set -e

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo "Error: .env.production file not found!"
  echo "Please create a .env.production file with your production environment variables."
  exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "Error: Required environment variables are not set in .env.production!"
  echo "Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
  exit 1
fi

# Build the Docker image with build arguments
echo "Building Docker image with environment variables..."
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -t affillia-sports-landing:latest .

# Stop any existing container
echo "Stopping any existing container..."
docker stop affillia-sports-landing 2>/dev/null || true
docker rm affillia-sports-landing 2>/dev/null || true

# Run the Docker container
echo "Starting new container..."
docker run -d --name affillia-sports-landing -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -e NODE_ENV=production \
  --restart always \
  affillia-sports-landing:latest

echo "Deployment completed successfully!"
echo "The application is now running at http://localhost:3000"