#!/bin/bash

# Create necessary directories
mkdir -p public/images/logos

echo "Creating optimized images for Affillia Sports website..."

# Check if logo files exist in current directory
if [ ! -f "affillia-logo-light.png" ] || [ ! -f "affillia-logo-dark.png" ]; then
  echo "Error: Logo files not found in current directory."
  echo "Please ensure 'affillia-logo-light.png' and 'affillia-logo-dark.png' exist in the same directory as this script."
  exit 1
fi

# Copy original files
cp affillia-logo-light.png public/images/logos/
cp affillia-logo-dark.png public/images/logos/

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
  echo "cwebp is not installed. Please install it:"
  echo "  macOS: brew install webp"
  echo "  Ubuntu/Debian: sudo apt-get install webp"
  echo "  Windows: Download from https://developers.google.com/speed/webp/download"
  exit 1
fi

# Convert to WebP format
echo "Converting logos to WebP format..."
cwebp -q 90 public/images/logos/affillia-logo-light.png -o public/images/logos/affillia-logo-light.webp
cwebp -q 90 public/images/logos/affillia-logo-dark.png -o public/images/logos/affillia-logo-dark.webp

# Create responsive sizes
echo "Creating responsive sizes..."

# Desktop sizes (100% width)
cwebp -q 90 -resize 250 0 public/images/logos/affillia-logo-light.png -o public/images/logos/affillia-logo-light-large.webp
cwebp -q 90 -resize 250 0 public/images/logos/affillia-logo-dark.png -o public/images/logos/affillia-logo-dark-large.webp

# Tablet sizes (75% width)
cwebp -q 85 -resize 180 0 public/images/logos/affillia-logo-light.png -o public/images/logos/affillia-logo-light-medium.webp
cwebp -q 85 -resize 180 0 public/images/logos/affillia-logo-dark.png -o public/images/logos/affillia-logo-dark-medium.webp

# Mobile sizes (50% width)
cwebp -q 80 -resize 120 0 public/images/logos/affillia-logo-light.png -o public/images/logos/affillia-logo-light-small.webp
cwebp -q 80 -resize 120 0 public/images/logos/affillia-logo-dark.png -o public/images/logos/affillia-logo-dark-small.webp

# Create favicon versions
echo "Creating favicon versions..."

# Check if ImageMagick is installed (for favicon creation)
if command -v convert &> /dev/null; then
  # Create square crop of the logo for favicon
  convert public/images/logos/affillia-logo-light.png -background white -gravity center -resize 256x256 -extent 256x256 public/images/logos/favicon.png
  convert public/images/logos/favicon.png -resize 16x16 public/images/logos/favicon-16x16.png
  convert public/images/logos/favicon.png -resize 32x32 public/images/logos/favicon-32x32.png
  convert public/images/logos/favicon.png -resize 180x180 public/images/logos/apple-touch-icon.png
  
  # Create SVG favicon (simplified version)
  echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text x="10" y="80" font-family="serif" font-size="80" font-weight="bold">A</text>
</svg>' > public/images/logos/favicon.svg
  
  echo "Favicon images created successfully."
else
  echo "ImageMagick not installed. Skipping favicon creation."
  echo "To create favicons, please install ImageMagick:"
  echo "  macOS: brew install imagemagick"
  echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
  echo "  Windows: Download from https://imagemagick.org/script/download.php"
fi

echo "Image optimization complete. Files saved to public/images/logos/"
echo ""
echo "Usage instructions:"
echo "1. The Navbar component will use: /images/logos/affillia-logo-light.webp (with PNG fallback)"
echo "2. The Footer component will use: /images/logos/affillia-logo-dark.webp (with PNG fallback)"
echo "3. Favicon files are available in multiple formats and sizes"
echo ""
echo "Make sure you've updated the Navbar.tsx and Footer.tsx components to use these images." 