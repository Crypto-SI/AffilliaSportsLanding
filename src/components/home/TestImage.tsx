import { Box } from '@chakra-ui/react';
import Image from 'next/image';

export default function TestImage() {
  return (
    <Box padding={10} backgroundColor="white">
      <h1>Test Image Component</h1>
      
      <Box position="relative" width="300px" height="300px" margin="20px">
        <Image
          src="/carl.png"
          alt="Test image 1"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </Box>

      <Box position="relative" width="300px" height="300px" margin="20px">
        <Image
          src="/carl.png"
          alt="Test image 2"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </Box>

      <Box margin="20px">
        <img 
          src="/images/carl.png"
          alt="Regular img tag"
          style={{ width: '200px', height: '200px' }}
        />
      </Box>
    </Box>
  );
} 