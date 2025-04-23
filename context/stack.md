# Affillia Sports Landing Page Tech Stack

This document provides a comprehensive overview of the technologies, frameworks, libraries, and tools used in the Affillia Sports Landing Page project.

## Core Technologies

### Frontend Framework
- **Next.js**: v15.2.4
  - Server-side rendering and static site generation
  - File-based routing
  - API routes
  - Output: Standalone mode for optimized deployment
  - Image optimization with next/image

### UI Frameworks and Libraries
- **React**: v19.0.0
  - React DOM: v19.0.0
  - Functional components with hooks
  - Client-side rendering

- **Chakra UI**: v2.8.2
  - Component library for responsive layouts
  - Theming system
  - Chakra UI Icons: v2.2.4
  - Optimized package imports configured

- **Emotion**: 
  - @emotion/react: v11.11.3
  - @emotion/styled: v11.11.0
  - CSS-in-JS styling solution used by Chakra UI

### Animation
- **Motion**: v12.6.3
  - Animation library for React components
  - Used for page transitions and component animations

### Icons
- **React Icons**: v5.5.0
  - Icon library with multiple icon sets

## Development Tools

### Language
- **TypeScript**: v5.x
  - Static type checking
  - Enhanced IDE support
  - Configured for ESNext targets

### Linting and Formatting
- **ESLint**: v9.x
  - eslint-config-next: 15.2.4
  - @eslint/eslintrc: v3.x
  - Configured to ignore errors during builds

### CSS Processing
- **TailwindCSS**: v4.x
  - Utility-first CSS framework
  - @tailwindcss/postcss: v4.x

### Package Management
- **npm**
  - Dependency management
  - Script running

## Deployment and Infrastructure

### Containerization
- **Docker**
  - Node.js: v20-alpine as base image
  - Multi-stage build process:
    - deps: Dependencies installation
    - builder: Application build
    - runner: Production runtime
  - Non-root user (nextjs) for security

### Configuration
- **Environment Variables**
  - NODE_ENV: For environment detection
  - PORT: 3000 for application serving

### Build Process
- **npm scripts**:
  - dev: Local development server
  - build: Production build
  - start: Production server
  - lint: Code linting

## Project Structure

The project follows a standard Next.js application structure with:

- `/src`: Main application code
  - `/app`: Next.js App Router components
  - `/components`: Reusable React components
    - `/ui`: UI components (animated components, etc.)
    - `/layout`: Layout components
    - `/home`: Homepage specific components
    - `/intro`: Introduction/splash components
  - globals.css: Global CSS styles

- `/public`: Static assets
  - `/images`: Image files
    - `/optimized`: Optimized image versions for different sections

## Performance Optimizations

- Standalone Next.js output mode for optimized production deployment
- ChakraUI optimized package imports
- Docker multi-stage builds for smaller production images
- Image optimization with next/image and size handling
- Animation optimizations with lazy loading 