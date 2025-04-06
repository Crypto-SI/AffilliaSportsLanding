#!/bin/bash

# This script converts just the founder portrait image (3.png) to WebP format

# Create directory if it doesn't exist
mkdir -p public/images/optimized/about/large
mkdir -p public/images/optimized/about/medium
mkdir -p public/images/optimized/about/small

# Get source file
src_file="public/images/3.png"

echo "Converting image $src_file to WebP format..."

# Get image dimensions
dimensions=$(identify -format "%wx%h" "$src_file")
width=$(echo $dimensions | cut -d'x' -f1)
height=$(echo $dimensions | cut -d'x' -f2)

# Large size (original dimensions)
output_file="public/images/optimized/about/large/about-founder-portrait.webp"
echo "  Converting to large ($width x $height) at quality 80..."
cwebp -q 80 "$src_file" -o "$output_file"

# Medium size (50% of original)
medium_width=$(($width / 2))
medium_height=$(($height * $medium_width / $width))
output_file="public/images/optimized/about/medium/about-founder-portrait.webp"
echo "  Converting to medium ($medium_width x $medium_height) at quality 78..."
cwebp -resize $medium_width $medium_height -q 78 "$src_file" -o "$output_file"

# Small size (30% of original)
small_width=$(($width * 30 / 100))
small_height=$(($height * $small_width / $width))
output_file="public/images/optimized/about/small/about-founder-portrait.webp"
echo "  Converting to small ($small_width x $small_height) at quality 75..."
cwebp -resize $small_width $small_height -q 75 "$src_file" -o "$output_file"

echo "Image conversion complete! The updated founder portrait is now available in WebP format." 