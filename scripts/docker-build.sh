#!/bin/bash

# Exit on error
set -e

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo "Error: .env.production file not found!"
  echo "Please create a .env.production file with your production environment variables."
  exit 1
fi

# Load environment variables from .env.production
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

# Run the Docker container
echo "Running Docker container..."
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -e NODE_ENV=production \
  affillia-sports-landing:latest

echo "Docker container is running at http://localhost:3000"