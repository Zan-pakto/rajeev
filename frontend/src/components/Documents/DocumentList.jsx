import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  Select,
  HStack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { FiMoreVertical, FiDownload, FiTrash2, FiShare2 } from 'react-icons/fi';
import axios from 'axios';

const DocumentList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('uploadedAt');
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await axios.get('/api/documents', {
        withCredentials: true,
      });
      return response.data.documents;
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (documentId) => {
      await axios.delete(`/api/documents/${documentId}`, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
      toast({
        title: 'Document deleted',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting document',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    },
  });

  const handleShare = async (documentId) => {
    try {
      const response = await axios.post(
        `/api/documents/${documentId}/share`,
        {},
        { withCredentials: true }
      );
      
      // Copy share link to clipboard
      navigator.clipboard.writeText(response.data.shareUrl);
      
      toast({
        title: 'Share link copied to clipboard',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error sharing document',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDownload = async (documentId, fileName) => {
    try {
      const response = await axios.get(`/api/documents/${documentId}/download`, {
        responseType: 'blob',
        withCredentials: true,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: 'Error downloading document',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const filteredDocuments = documents?.filter((doc) =>
    doc.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedDocuments = [...(filteredDocuments || [])].sort((a, b) => {
    if (sortBy === 'name') {
      return a.originalName.localeCompare(b.originalName);
    }
    return new Date(b[sortBy]) - new Date(a[sortBy]);
  });

  if (isLoading) {
    return <Text>Loading documents...</Text>;
  }

  return (
    <Box>
      <HStack spacing={4} mb={4}>
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="uploadedAt">Upload Date</option>
          <option value="processedAt">Process Date</option>
          <option value="name">Name</option>
        </Select>
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Status</Th>
            <Th>Uploaded</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedDocuments.map((doc) => (
            <Tr key={doc._id}>
              <Td>{doc.originalName}</Td>
              <Td>{doc.status}</Td>
              <Td>{new Date(doc.uploadedAt).toLocaleDateString()}</Td>
              <Td>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiMoreVertical />}
                    variant="ghost"
                    size="sm"
                  />
                  <MenuList>
                    <MenuItem
                      icon={<FiDownload />}
                      onClick={() => handleDownload(doc._id, doc.originalName)}
                    >
                      Download
                    </MenuItem>
                    <MenuItem
                      icon={<FiShare2 />}
                      onClick={() => handleShare(doc._id)}
                    >
                      Share
                    </MenuItem>
                    <MenuItem
                      icon={<FiTrash2 />}
                      onClick={() => deleteDocument.mutate(doc._id)}
                      color="red.500"
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default DocumentList; 