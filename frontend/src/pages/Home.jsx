import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  VStack,
  Heading,
  Text,
  Button,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  List,
  ListItem,
  Icon,
  HStack,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FiFolder, FiTag, FiSearch, FiUpload } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import DocumentList from '../components/Documents/DocumentList';
import DocumentSummary from '../components/Documents/DocumentSummary';
import FileUpload from '../components/Documents/FileUpload';

const Home = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState('root');
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const folders = [
    { id: 'root', name: 'All Documents', icon: FiFolder },
    { id: 'recent', name: 'Recent', icon: FiFolder },
    { id: 'archived', name: 'Archived', icon: FiFolder },
  ];

  const tags = [
    { id: 'legal', name: 'Legal', color: 'blue' },
    { id: 'contract', name: 'Contract', color: 'green' },
    { id: 'important', name: 'Important', color: 'red' },
  ];

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
  };

  const handleFolderSelect = (folderId) => {
    setSelectedFolder(folderId);
    setSelectedDocument(null);
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
    setSelectedDocument(null);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Grid templateColumns="250px 1fr" gap={8}>
        {/* Sidebar */}
        <VStack align="stretch" spacing={6}>
          <Button
            leftIcon={<FiUpload />}
            colorScheme="blue"
            onClick={onOpen}
            size="lg"
            width="full"
          >
            Upload Document
          </Button>

          <Box>
            <Text fontWeight="bold" mb={2}>
              Folders
            </Text>
            <List spacing={2}>
              {folders.map((folder) => (
                <ListItem
                  key={folder.id}
                  onClick={() => handleFolderSelect(folder.id)}
                  cursor="pointer"
                  p={2}
                  borderRadius="md"
                  bg={selectedFolder === folder.id ? 'blue.50' : 'transparent'}
                  _hover={{ bg: 'gray.50' }}
                >
                  <HStack>
                    <Icon as={folder.icon} />
                    <Text>{folder.name}</Text>
                  </HStack>
                </ListItem>
              ))}
            </List>
          </Box>

          <Box>
            <Text fontWeight="bold" mb={2}>
              Tags
            </Text>
            <List spacing={2}>
              {tags.map((tag) => (
                <ListItem
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  cursor="pointer"
                  p={2}
                  borderRadius="md"
                  bg={selectedTags.includes(tag.id) ? 'blue.50' : 'transparent'}
                  _hover={{ bg: 'gray.50' }}
                >
                  <HStack>
                    <Icon as={FiTag} color={`${tag.color}.500`} />
                    <Text>{tag.name}</Text>
                  </HStack>
                </ListItem>
              ))}
            </List>
          </Box>
        </VStack>

        {/* Main Content */}
        <Box>
          <VStack align="stretch" spacing={6}>
            <HStack justify="space-between">
              <Heading size="lg">
                {folders.find((f) => f.id === selectedFolder)?.name}
              </Heading>
              <InputGroup maxW="300px">
                <InputLeftElement>
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </HStack>

            {selectedDocument ? (
              <DocumentSummary documentId={selectedDocument._id} />
            ) : (
              <DocumentList
                folder={selectedFolder}
                tags={selectedTags}
                searchQuery={searchQuery}
                onDocumentSelect={handleDocumentSelect}
              />
            )}
          </VStack>
        </Box>
      </Grid>

      {/* Upload Drawer */}
      <Drawer isOpen={isOpen} onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Upload Document</DrawerHeader>
          <DrawerBody>
            <FileUpload onSuccess={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Container>
  );
};

export default Home;