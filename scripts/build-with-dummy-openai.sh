#!/bin/bash

# Exit on error
set -e

# Set a dummy OpenAI API key for the build process
export OPENAI_API_KEY="sk-dummy-key-for-build-process-only"

# Run the Next.js build
npm run build