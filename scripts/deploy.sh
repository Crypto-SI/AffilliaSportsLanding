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

# Build and deploy using docker-compose
echo "Building and deploying with docker-compose..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "Deployment completed successfully!"
echo "The application is now running at https://affilliasports.com"