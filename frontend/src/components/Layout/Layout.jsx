import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import Navigation from './Navigation';

const Layout = ({ children }) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Navigation />
      <Container maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout; 