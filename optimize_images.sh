#!/bin/bash

# Create directory structure for optimized images
mkdir -p public/images/optimized/{hero,about,highlights,services,stats,footer}/{large,medium,small}

# Define quality levels based on image type
# Images 1-2: Hero section (80-85% quality)
# Images 3-5: About section (75-80% quality)
# Images 6-8: Highlights section (75-80% quality)
# Images 9-12: Services section (70-75% quality)
# Image 13: Stats section (75-80% quality)
# Image 14: Footer section (75-80% quality)

# Function to determine target directory based on image number
get_directory() {
  local img_num=$1
  if [ $img_num -le 2 ]; then
    echo "hero"
  elif [ $img_num -le 5 ]; then
    echo "about"
  elif [ $img_num -le 8 ]; then
    echo "highlights"
  elif [ $img_num -le 12 ]; then
    echo "services"
  elif [ $img_num -eq 13 ]; then
    echo "stats"
  else
    echo "footer"
  fi
}

# Function to determine quality based on image number
get_quality() {
  local img_num=$1
  local size=$2
  
  # Base quality level
  if [ $img_num -le 2 ]; then
    # Hero images: higher quality
    base_quality=82
  elif [ $img_num -ge 9 ] && [ $img_num -le 12 ]; then
    # Service icons: lower quality
    base_quality=72
  else
    # Other section images: medium quality
    base_quality=78
  fi
  
  # Adjust quality based on size
  if [ "$size" = "medium" ]; then
    echo $((base_quality - 2))
  elif [ "$size" = "small" ]; then
    echo $((base_quality - 5))
  else
    echo $base_quality
  fi
}

# Process each image
for img_num in {1..14}; do
  echo "Processing image $img_num..."
  
  # Get source file
  src_file="public/images/${img_num}.png"
  
  # Skip if file doesn't exist
  if [ ! -f "$src_file" ]; then
    echo "File $src_file not found, skipping..."
    continue
  fi
  
  # Get image dimensions
  dimensions=$(identify -format "%wx%h" "$src_file")
  width=$(echo $dimensions | cut -d'x' -f1)
  height=$(echo $dimensions | cut -d'x' -f2)
  
  # Get directory for this image
  dir=$(get_directory $img_num)
  
  # Create different sizes and convert to WebP
  for size in "large" "medium" "small"; do
    if [ "$size" = "large" ]; then
      resize_width=$width
    elif [ "$size" = "medium" ]; then
      resize_width=$(($width / 2))
    else
      resize_width=$(($width * 30 / 100))
    fi
    
    # Calculate proportional height
    resize_height=$(($height * $resize_width / $width))
    
    # Get quality for this image and size
    quality=$(get_quality $img_num $size)
    
    # Define descriptive name based on image number
    case $img_num in
      1) name="hero-main-banner" ;;
      2) name="hero-player-silhouette" ;;
      3) name="about-founder-portrait" ;;
      4) name="about-team-meeting" ;;
      5) name="about-success-story" ;;
      6) name="highlights-contract-negotiation" ;;
      7) name="highlights-career-development" ;;
      8) name="highlights-media-relations" ;;
      9) name="services-representation" ;;
      10) name="services-negotiation" ;;
      11) name="services-image-rights" ;;
      12) name="services-career-path" ;;
      13) name="stats-background" ;;
      14) name="footer-texture" ;;
    esac
    
    # Output filename
    output_file="public/images/optimized/${dir}/${size}/${name}.webp"
    
    echo "  Converting to $size ($resize_width x $resize_height) at quality $quality..."
    
    # Resize and convert to WebP
    cwebp -resize $resize_width $resize_height -q $quality "$src_file" -o "$output_file"
    
    # Create JPEG fallback for older browsers
    output_jpeg="public/images/optimized/${dir}/${size}/${name}.jpg"
    convert "$src_file" -resize ${resize_width}x${resize_height} -quality $quality "$output_jpeg"
  done
done

echo "Image optimization complete! Optimized images are in public/images/optimized/"
echo "Directory structure follows the plan from images.md" 