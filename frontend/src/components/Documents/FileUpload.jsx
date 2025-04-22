import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Icon,
  useToast,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Progress,
} from '@chakra-ui/react';
import { FiUpload, FiFile } from 'react-icons/fi';
import axios from 'axios';

const FileUpload = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState('root');
  const [selectedTags, setSelectedTags] = useState([]);
  const fileInputRef = useRef();
  const toast = useToast();

  const folders = [
    { id: 'root', name: 'Root' },
    { id: 'contracts', name: 'Contracts' },
    { id: 'agreements', name: 'Agreements' },
    { id: 'reports', name: 'Reports' },
  ];

  const availableTags = [
    { id: 'legal', name: 'Legal', color: 'blue' },
    { id: 'contract', name: 'Contract', color: 'green' },
    { id: 'important', name: 'Important', color: 'red' },
    { id: 'review', name: 'Review', color: 'orange' },
    { id: 'draft', name: 'Draft', color: 'gray' },
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF, DOCX, or TXT file.',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 20MB.',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('folder', selectedFolder);
    formData.append('tags', JSON.stringify(selectedTags));

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await axios.post('/api/upload', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      if (response.data.success) {
        toast({
          title: 'Upload successful',
          description: 'Your document has been uploaded and is being processed.',
          status: 'success',
          duration: 3000,
        });
        onSuccess();
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setFile(null);
      fileInputRef.current.value = '';
    }
  };

  const handleTagSelect = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        borderWidth={2}
        borderRadius="lg"
        borderStyle="dashed"
        p={10}
        textAlign="center"
        bg={file ? 'green.50' : 'gray.50'}
        _hover={{ bg: 'gray.100' }}
        transition="all 0.2s"
      >
        <Input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileSelect}
          display="none"
          ref={fileInputRef}
        />
        <VStack spacing={2}>
          <Icon as={file ? FiFile : FiUpload} w={10} h={10} color="gray.400" />
          {file ? (
            <Text color="green.500" fontWeight="medium">
              {file.name}
            </Text>
          ) : (
            <>
              <Text fontWeight="medium">
                Drag and drop your file here, or click to browse
              </Text>
              <Text fontSize="sm" color="gray.500">
                Supports PDF, DOCX, and TXT (up to 20MB)
              </Text>
            </>
          )}
        </VStack>
      </Box>

      {file && (
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Folder</FormLabel>
            <Select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
            >
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Tags</FormLabel>
            <Wrap spacing={2} mb={2}>
              {availableTags.map((tag) => (
                <WrapItem key={tag.id}>
                  <Tag
                    size="md"
                    variant={selectedTags.includes(tag.id) ? 'solid' : 'outline'}
                    colorScheme={tag.color}
                    cursor="pointer"
                    onClick={() => handleTagSelect(tag.id)}
                  >
                    <TagLabel>{tag.name}</TagLabel>
                    {selectedTags.includes(tag.id) && (
                      <TagCloseButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTagSelect(tag.id);
                        }}
                      />
                    )}
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          </FormControl>

          {isUploading && (
            <Progress
              value={uploadProgress}
              size="sm"
              colorScheme="blue"
              borderRadius="full"
            />
          )}

          <Button
            colorScheme="blue"
            onClick={handleUpload}
            isLoading={isUploading}
            loadingText="Uploading..."
          >
            Upload Document
          </Button>
        </VStack>
      )}

      {!file && (
        <Button
          onClick={() => fileInputRef.current.click()}
          variant="outline"
          width="full"
        >
          Browse Files
        </Button>
      )}
    </VStack>
  );
};

export default FileUpload; 