# Affilia Sports Landing Page

A modern, responsive landing page for Affilia Sports built with Next.js 15, TailwindCSS, and modern animation libraries.

## Features

- Responsive design for all device sizes
- Modern UI with smooth animations
- Optimized images and assets
- SEO friendly structure
- Fast loading times with Next.js optimizations

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/CryptoSI/AffiliaSportsLandingPage.git
   cd AffiliaSportsLandingPage
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result

### Building for production

```bash
npm run build
# or
yarn build
```

## Docker Instructions

### Development with Docker

1. Create a `.env.local` file with your environment variables (copy from `.env.example`)

2. Build and start the development container:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. Access the development server at [http://localhost:3000](http://localhost:3000)

### Production Deployment with Docker

1. Create a `.env.production` file with your production environment variables (copy from `.env.production.example`)

2. Use the deployment script:
   ```bash
   ./scripts/deploy.sh
   ```
   
   Or manually build and run:
   ```bash
   # Build the production image
   docker-compose -f docker-compose.prod.yml build
   
   # Start the container
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. Access your production application at [http://localhost:3000](http://localhost:3000)

### Docker Configuration

The project includes several Docker-related files:

- `Dockerfile` - Production build configuration
- `Dockerfile.dev` - Development configuration with hot-reloading
- `docker-compose.yml` - Base Docker Compose configuration
- `docker-compose.dev.yml` - Development-specific settings
- `docker-compose.prod.yml` - Production-specific settings with resource limits

### Environment Variables

When running with Docker in production, environment variables are passed from your host machine's `.env.production` file to the container. Make sure this file contains the correct values for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Other required environment variables

For local development, use `.env.local` which is not committed to git and overrides the default environment variables.

**Note:** We use a single source of truth for environment variables in each environment:
- Production: `.env.production`
- Development: `.env.local` (for local overrides)

## Future Features Roadmap

<!-- 
This section will outline planned features and improvements:
-->

- [ ] Integrated blog platform
- [ ] User account system
- [ ] Enhanced analytics dashboard
- [ ] Multi-language support
- [ ] Progressive Web App (PWA) capabilities
- [ ] Advanced SEO optimizations

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
