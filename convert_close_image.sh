#!/bin/bash

# This script converts the Close Protection image (close.png) to WebP format

# Create directory if it doesn't exist
mkdir -p public/images/optimized/services/large
mkdir -p public/images/optimized/services/medium
mkdir -p public/images/optimized/services/small

# Get source file
src_file="public/images/close.png"

echo "Converting image $src_file to WebP format..."

# Get image dimensions
dimensions=$(identify -format "%wx%h" "$src_file")
width=$(echo $dimensions | cut -d'x' -f1)
height=$(echo $dimensions | cut -d'x' -f2)

# Large size (original dimensions)
output_file="public/images/optimized/services/large/services-protection.webp"
echo "  Converting to large ($width x $height) at quality 72..."
cwebp -q 72 "$src_file" -o "$output_file"

# Medium size (50% of original)
medium_width=$(($width / 2))
medium_height=$(($height * $medium_width / $width))
output_file="public/images/optimized/services/medium/services-protection.webp"
echo "  Converting to medium ($medium_width x $medium_height) at quality 70..."
cwebp -resize $medium_width $medium_height -q 70 "$src_file" -o "$output_file"

# Small size (30% of original)
small_width=$(($width * 30 / 100))
small_height=$(($height * $small_width / $width))
output_file="public/images/optimized/services/small/services-protection.webp"
echo "  Converting to small ($small_width x $small_height) at quality 67..."
cwebp -resize $small_width $small_height -q 67 "$src_file" -o "$output_file"

echo "Image conversion complete! Close Protection service image is now available in WebP format." 