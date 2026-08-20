'use client';

import { Box, Link, Tooltip } from '@chakra-ui/react';

const WHATSAPP_NUMBER = '447773754138';
const WHATSAPP_MESSAGE = "Hi Affillia Sports! I'd like to find out more.";

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <Tooltip label="Chat with us on WhatsApp" hasArrow placement="left" aria-label="Chat with us on WhatsApp">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        position="fixed"
        bottom={{ base: '1rem', md: '1.5rem' }}
        right={{ base: '1rem', md: '1.5rem' }}
        zIndex={9999}
        display="flex"
        alignItems="center"
        justifyContent="center"
        width={{ base: '52px', md: '60px' }}
        height={{ base: '52px', md: '60px' }}
        borderRadius="full"
        bg="#25D366"
        color="white"
        boxShadow="0 4px 16px rgba(0, 0, 0, 0.3)"
        _hover={{ transform: 'scale(1.08)', bg: '#1ebe5b' }}
        _active={{ transform: 'scale(0.95)' }}
        transition="all 0.2s ease"
      >
        <svg
          width="60%"
          height="60%"
          viewBox="0 0 32 32"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.594 4.466 1.72 6.412L3.2 28.8l6.564-1.686a12.74 12.74 0 0 0 6.24 1.628h.005c7.06 0 12.8-5.74 12.8-12.8s-5.744-12.8-12.805-12.8zm0 23.398h-.004a10.63 10.63 0 0 1-5.416-1.483l-.389-.23-4.03 1.036 1.077-3.93-.253-.404a10.573 10.573 0 0 1-1.622-5.652c0-5.863 4.772-10.633 10.64-10.633 2.84 0 5.507 1.107 7.516 3.118a10.56 10.56 0 0 1 3.114 7.52c0 5.863-4.772 10.628-10.623 10.628zm5.834-7.977c-.32-.16-1.891-.933-2.184-1.04-.293-.107-.507-.16-.72.16-.213.32-.826 1.04-1.013 1.253-.187.213-.373.24-.693.08-.32-.16-1.35-.497-2.571-1.586-.951-.848-1.594-1.896-1.781-2.216-.187-.32-.02-.494.14-.653.144-.143.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.734-.986-2.373-.26-.623-.523-.539-.72-.549l-.613-.01c-.213 0-.56.08-.853.4-.293.32-1.12 1.094-1.12 2.667s1.147 3.093 1.307 3.306c.16.213 2.259 3.446 5.47 4.831.765.33 1.362.527 1.827.674.768.244 1.466.21 2.019.127.616-.092 1.891-.773 2.157-1.52.267-.746.267-1.386.187-1.52-.08-.133-.293-.213-.613-.373z" />
        </svg>
      </Link>
    </Tooltip>
  );
}
