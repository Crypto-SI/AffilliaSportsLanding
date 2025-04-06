# Animation Plan for Affillia Sports Website

This document outlines the comprehensive plan for implementing animations across the Affillia Sports website using the Motion library (https://github.com/motiondivision/motion).

## 1. Setup & Integration ✅

1. **Install Motion:** ✅
   ```bash
   npm install motion
   ```

2. **Create Animation Provider:** ✅
   - Integrated Motion into the existing provider component (`src/components/ui/provider.tsx`)
   - Added necessary configuration for animation defaults

## 2. Reusable Animation Components ✅

Created three reusable animation components for consistent usage across the site:

1. **AnimatedSection Component** ✅
   - Created for section-level animations
   - Supports multiple directions and customizable delay
   - Handles scroll-based reveal animations

2. **AnimatedText Component** ✅
   - Created for text animations
   - Supports both block text and staggered word animations
   - Configurable delay and duration

3. **AnimatedImage Component** ✅
   - Created for image animations
   - Supports fade, zoom, slide, and reveal effects
   - Compatible with Next.js Image component

## 3. Component-Specific Animations

### Navbar (src/components/layout/Navbar.tsx) ✅
- Added fade-in on initial page load
- Implemented staggered animations for navigation links
- Added hover animations for logo and links

### Hero Section (src/components/home/HeroSection.tsx) ✅
- Background image: Added subtle zoom effect on load
- Implemented staggered word-by-word reveal for heading
- Added slide-in effect for player silhouette
- Applied hover animations for buttons
- Animated decorative circle blur element

### About Section (src/components/home/AboutSection.tsx) ✅
- Added staggered fade-in for section title and description
- Implemented slide-in animations for cards from alternate directions
- Added reveal effect for founder portraits
- Applied hover animations for "Learn More" links

### Services Section (src/components/home/ServicesSection.tsx) ✅
- Added scale/fade entry animation on scroll for service cards
- Added icon rotation/bounce on hover
- Added card hover elevation changes with smooth transitions

### Philosophy Section (src/components/home/PhilosophySection.tsx) ✅
- Added staggered fade-in for text blocks with vertical movement
- Added parallax scrolling effect for the background blur element
- Added highlight animations for key quotes
- Added hover effect for the download button

### Stats Section (src/components/home/StatsSection.tsx) ✅
- Added number counter animations with automatic value parsing
- Added staggered entry animations for stat containers
- Added subtle zoom effect for the background image

### Highlights Section (src/components/home/HighlightsSection.tsx) ✅
- Added slide-in effect for cards on scroll
- Added zoom effect for featured images
- Implemented staggered entry for section titles and descriptions
- Added hover effects for cards and circular accents

### Player Portal Section (src/components/home/PlayerPortalSection.tsx) ✅
- Added interactive hover effects for the portal preview
- Added pulsing animation for feature indicators
- Implemented staggered reveal for feature descriptions
- Added hover animations for the register button

### Footer (src/components/layout/Footer.tsx) ✅
- Added subtle fade-in on scroll
- Added hover animations for social icons
- Implemented staggered reveal for footer columns
- Added subtle scale effect for the background texture

## 4. Next Steps

1. **Performance Optimization**
   - Test animation performance on different devices
   - Adjust timing and effects as needed

2. **Accessibility**
   - Ensure animations respect reduced motion preferences
   - Test with screen readers and keyboard navigation

## 5. Future Enhancements

1. **Page Transitions**
   - Add smooth transitions between pages
   - Implement shared layout animations

2. **Interactive Elements**
   - Add more interactive animations for user engagement
   - Consider adding gesture-based animations for mobile

## 6. Resources

- [Motion Documentation](https://github.com/motiondivision/motion)
- [Animation Principles](https://motion.dev/guides/animation-principles)
- [Accessibility Considerations](https://web.dev/articles/prefers-reduced-motion) 