# Football Agents Website Image Requirements

## Hero Section

1. **Main Hero Banner Image**
   - **Description**: A wide panoramic shot of a professional football stadium during a match, preferably at dusk with stadium lights on. The image should show a packed stadium with a clear view of the pitch where a key moment in a match is happening. The atmosphere should feel electric and exciting.
   - **Size**: 1920x1080px (16:9 aspect ratio)
   - **Style**: High contrast, vibrant colors with emphasis on the club's brand colors
   - **Focus**: The action on the pitch with dramatic lighting from the stadium floodlights
   - **Mood**: Exciting, aspirational, professional

2. **Hero Overlay Player Silhouette**
   - **Description**: A professional football player in mid-action (like performing a skill move or celebration), shown as a silhouette or with subtle lighting. This should be on a transparent background so it can be positioned to overlap the main hero image.
   - **Size**: 800x1000px
   - **Style**: Dynamic pose, professional attire
   - **Focus**: The silhouette should emphasize the athleticism and skill of the player
   - **Usage**: To be overlaid on the right or left side of the hero section

## About Section

3. **Founder/Agency Director Portrait**
   - **Description**: Professional headshot of the agency's founder or director in business attire, smiling confidently. The person should be well-dressed in a suit that matches the brand colors.
   - **Size**: 600x800px
   - **Style**: Professional, warm lighting, neutral background
   - **Focus**: Clear face shot with confident, approachable expression
   - **Mood**: Trustworthy, professional, confident

4. **Team Meeting Image**
   - **Description**: A scene showing agents meeting with a player, reviewing documents or having a strategic discussion. Should be in a modern office environment with football memorabilia visible.
   - **Size**: 800x600px
   - **Style**: Natural lighting, professional setting
   - **Focus**: The interaction between agent and player, showing the relationship of trust
   - **Mood**: Professional, collaborative, supportive

5. **Success Story Image**
   - **Description**: A composite image showing a player's journey - perhaps split into before/after shots of a player signing a contract and then playing for a major club.
   - **Size**: 800x500px
   - **Style**: Split image or progression style
   - **Focus**: The transformation and success story
   - **Mood**: Inspirational, achievement-oriented

## Highlights Section

6. **Contract Negotiation Image**
   - **Description**: Close-up shot of hands signing a contract with a football club's logo or merchandise visible in the background. Pen should be positioned on the signature line.
   - **Size**: 700x500px
   - **Style**: Close-up, detailed
   - **Focus**: The moment of signing, symbolizing successful negotiation
   - **Mood**: Professional, momentous

7. **Career Development Training Shot**
   - **Description**: Action shot of a player training with visible coaching/guidance. Should show intensity and dedication with a coach or mentor figure providing instruction.
   - **Size**: 700x500px
   - **Style**: Dynamic, action-oriented
   - **Focus**: The training process and mentorship
   - **Mood**: Determined, growth-focused

8. **Media Relations Image**
   - **Description**: Shot of a player at a press conference or media interview, looking confident and professional. Should include microphones, cameras, or other media equipment.
   - **Size**: 700x500px
   - **Style**: Press event setting
   - **Focus**: The player's comfort and confidence in front of media
   - **Mood**: Poised, media-savvy

## Services Section

9. **Representation Service Icon/Image**
   - **Description**: A stylized image of a handshake between an agent and player, with a contract document visible.
   - **Size**: 400x400px
   - **Style**: Clean, icon-like but with photographic elements
   - **Focus**: The partnership aspect of representation
   - **Mood**: Trustworthy, official

10. **Contract Negotiation Service Icon/Image**
    - **Description**: Image of a negotiation table with visible documents, pen, and perhaps a trophy or football to symbolize the rewards of good negotiation.
    - **Size**: 400x400px
    - **Style**: Business setting with football elements
    - **Focus**: The strategic element of negotiations
    - **Mood**: Strategic, valuable

11. **Image Rights Management Icon/Image**
    - **Description**: Composite image showing a player's photo being used in various media - billboards, social media, and merchandise.
    - **Size**: 400x400px
    - **Style**: Collage-like arrangement
    - **Focus**: The various uses of a player's image
    - **Mood**: Commercial, protective

12. **Career Development Icon/Image**
    - **Description**: A path or staircase visual showing progression from amateur to professional levels, with a football player silhouette climbing upward.
    - **Size**: 400x400px
    - **Style**: Infographic-inspired
    - **Focus**: The upward trajectory of a player's career
    - **Mood**: Aspirational, developmental

## Stats Section

13. **Background Image for Stats**
    - **Description**: A subtle, blurred image of a football stadium or pitch as a background for the statistics. Should be dark or desaturated to allow the stat numbers to stand out.
    - **Size**: 1920x600px
    - **Style**: Blurred, atmospheric
    - **Focus**: Creating a football context without distracting from the stats
    - **Mood**: Professional, impressive

## Footer Section

14. **Footer Background Texture**
    - **Description**: A subtle textured background incorporating the brand's colors in a gradient or pattern. Could include faint outlines of football-related elements.
    - **Size**: 1920x500px
    - **Style**: Subtle, textured
    - **Focus**: Brand reinforcement
    - **Mood**: Professional, conclusive

## Image Optimization Plan

1. **File Format Conversion:**
   - Convert all images to WebP format as primary format with JPEG fallbacks for older browsers
   - Use the `cwebp` command-line tool or online converters like Squoosh.app

2. **Compression Levels:**
   - Hero images: 80-85% quality (balance between quality and file size)
   - Section images: 75-80% quality
   - Icon/smaller images: 70-75% quality

3. **Responsive Image Strategy:**
   - Create 3 sizes of each important image:
     - Large (original dimensions for desktop)
     - Medium (approximately 50% width for tablets)
     - Small (approximately 30% width for mobile)
   - Implement with HTML `srcset` attribute or Next.js Image component

4. **Implementation Steps:**
   1. Create/acquire original high-quality images
   2. Resize images for different viewport sizes
   3. Convert each size to WebP with appropriate compression
   4. Create JPEG fallbacks at similar quality levels
   5. Implement in code using Next.js Image component with priority loading for above-the-fold images

5. **Storage Organization:**
   - Store images in the `/public/images/` directory
   - Organize in subdirectories by section: `/hero`, `/about`, `/services`, etc.
   - Follow naming convention: `[section]-[image-name]-[size].webp`

## Summary Table

| ID | Image Name | Section | Size (px) | Format | Description | Style | Focus | Mood |
|----|------------|---------|-----------|--------|-------------|-------|-------|------|
| 1 | Main Hero Banner | Hero | 1920x1080 | WebP/JPEG | Stadium match scene at dusk | High contrast, vibrant | Action on pitch | Exciting, aspirational |
| 2 | Player Silhouette | Hero | 800x1000 | WebP/PNG | Player in mid-action silhouette | Dynamic pose | Athleticism | Professional |
| 3 | Founder Portrait | About | 600x800 | WebP/JPEG | Professional headshot | Warm lighting | Confident expression | Trustworthy |
| 4 | Team Meeting | About | 800x600 | WebP/JPEG | Agents meeting with player | Natural lighting | Agent-player interaction | Collaborative |
| 5 | Success Story | About | 800x500 | WebP/JPEG | Player journey composite | Split/progression | Transformation | Inspirational |
| 6 | Contract Negotiation | Highlights | 700x500 | WebP/JPEG | Hands signing contract | Close-up, detailed | Signing moment | Professional |
| 7 | Career Development | Highlights | 700x500 | WebP/JPEG | Training with coach | Dynamic, action | Training process | Determined |
| 8 | Media Relations | Highlights | 700x500 | WebP/JPEG | Press conference | Press event | Media confidence | Poised |
| 9 | Representation | Services | 400x400 | WebP/PNG | Handshake with contract | Clean, icon-like | Partnership | Trustworthy |
| 10 | Negotiation | Services | 400x400 | WebP/PNG | Negotiation table | Business with football | Strategy | Strategic |
| 11 | Image Rights | Services | 400x400 | WebP/PNG | Player image uses | Collage-like | Various media uses | Commercial |
| 12 | Career Path | Services | 400x400 | WebP/PNG | Progression staircase | Infographic-inspired | Upward trajectory | Aspirational |
| 13 | Stats Background | Stats | 1920x600 | WebP/JPEG | Blurred stadium | Atmospheric | Context for stats | Professional |
| 14 | Footer Texture | Footer | 1920x500 | WebP/JPEG | Brand colors texture | Subtle pattern | Brand reinforcement | Professional | 