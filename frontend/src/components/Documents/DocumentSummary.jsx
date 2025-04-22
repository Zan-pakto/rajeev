import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Select,
  List,
  ListItem,
  ListIcon,
  Card,
  CardBody,
  CardHeader,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  HStack,
} from '@chakra-ui/react';
import { MdCheckCircle } from 'react-icons/md';
import { FiDownload, FiGlobe } from 'react-icons/fi';
import axios from 'axios';

const DocumentSummary = ({ documentId }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const toast = useToast();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['summary', documentId],
    queryFn: async () => {
      const response = await axios.get(`/api/documents/${documentId}/summary`, {
        withCredentials: true,
      });
      return response.data.summary;
    },
  });

  const { data: translation, isLoading: isTranslating } = useQuery({
    queryKey: ['translation', documentId, selectedLanguage],
    queryFn: async () => {
      if (selectedLanguage === 'en') return summary;
      const response = await axios.post(
        `/api/documents/${documentId}/translate`,
        { targetLanguage: selectedLanguage },
        { withCredentials: true }
      );
      return response.data.translation;
    },
    enabled: !!summary && selectedLanguage !== 'en',
  });

  const handleExport = async (format) => {
    try {
      const response = await axios.get(
        `/api/documents/${documentId}/export/${format}`,
        {
          responseType: 'blob',
          withCredentials: true,
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `summary-${documentId}.${format.toLowerCase()}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: 'Summary exported successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error exporting summary',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const displayData = translation || summary;

  if (isLoading) {
    return <Text>Loading summary...</Text>;
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="md">Document Summary</Heading>
          <HStack spacing={4}>
            <Select
              icon={<FiGlobe />}
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              maxW="200px"
              isDisabled={isTranslating}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
            </Select>
            <Button
              leftIcon={<FiDownload />}
              onClick={() => handleExport('PDF')}
              colorScheme="blue"
            >
              Export PDF
            </Button>
            <Button
              leftIcon={<FiDownload />}
              onClick={() => handleExport('DOCX')}
              colorScheme="blue"
              variant="outline"
            >
              Export DOCX
            </Button>
          </HStack>
        </HStack>

        <Card>
          <CardHeader>
            <Heading size="sm">Key Points</Heading>
          </CardHeader>
          <CardBody>
            <List spacing={3}>
              {displayData?.key_points?.map((point, index) => (
                <ListItem key={index} display="flex">
                  <ListIcon as={MdCheckCircle} color="green.500" mt={1} />
                  <Text>{point}</Text>
                </ListItem>
              ))}
            </List>
          </CardBody>
        </Card>

        {displayData?.tables && displayData.tables.length > 0 && (
          <Card>
            <CardHeader>
              <Heading size="sm">Tables</Heading>
            </CardHeader>
            <CardBody>
              {displayData.tables.map((table, tableIndex) => (
                <Box key={tableIndex} mb={4}>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        {table.headers.map((header, index) => (
                          <Th key={index}>{header}</Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {table.rows.map((row, rowIndex) => (
                        <Tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <Td key={cellIndex}>{cell}</Td>
                          ))}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ))}
            </CardBody>
          </Card>
        )}

        {displayData?.highlights && displayData.highlights.length > 0 && (
          <Card>
            <CardHeader>
              <Heading size="sm">Important Highlights</Heading>
            </CardHeader>
            <CardBody>
              <List spacing={3}>
                {displayData.highlights.map((highlight, index) => (
                  <ListItem key={index} display="flex">
                    <ListIcon as={MdCheckCircle} color="yellow.500" mt={1} />
                    <Text>{highlight}</Text>
                  </ListItem>
                ))}
              </List>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default DocumentSummary; 