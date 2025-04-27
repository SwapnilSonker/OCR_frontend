import React, { useState } from 'react';
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import './App.css';

function App() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setSelectedImages(prevImages => [...prevImages, ...files]);
    const newUrls = files.map(file => URL.createObjectURL(file));
    setImageUrls(prevUrls => [...prevUrls, ...newUrls]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(prevImages => prevImages.filter((_, i) => i !== index));
    setImageUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedImages.length === 0) return;
    setLoading(true);
    setResponseData([]);

    try {
      const responses = await Promise.all(
        selectedImages.map(async (image) => {
          const formData = new FormData();
          formData.append('files', image);
          const response = await axios.post('https://ocr-3-9gmv.onrender.com/extract', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          return { ...response.data, fileName: image.name };
        })
      );
      setResponseData(responses);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setLoading(false);
    }
  };

  console.log("response data", responseData);

  return (
    <Container maxWidth="lg" className="app-container">
      <Paper elevation={3} className="main-paper" sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <h1 style={{ margin: 0, marginBottom: '1rem' }}>Image Data Extractor</h1>
          <input
            accept="image/*"
            type="file"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id="image-upload"
            multiple
          />
          <label htmlFor="image-upload">
            <Button variant="contained" component="span" className="upload-button">
              Upload Images
            </Button>
          </label>
        </Box>

        <div className="image-grid">
          {imageUrls.map((url, index) => (
            <div key={index} className="image-container">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="image-preview"
              />
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleRemoveImage(index)}
                className="remove-button"
              >
                ×
              </Button>
            </div>
          ))}
        </div>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={selectedImages.length === 0 || loading}
            className="process-button"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Process Images'}
          </Button>
        </Box>

        {responseData.length > 0 && (
          <TableContainer component={Paper} className="table-container">
            <Table className="custom-table">
              <TableHead className="table-head">
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>Topic</TableCell>
                  <TableCell>Venue</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Mode</TableCell>
                </TableRow>
              </TableHead>
              <TableBody className="table-body">
                {responseData.map((data, index) => (
                  <TableRow key={index} className="table-row">
                    <TableCell>{data?.fileName}</TableCell>
                    <TableCell>{data?.extracted_data[0].topic}</TableCell>
                    <TableCell>{data?.extracted_data[0].venue}</TableCell>
                    <TableCell>{data?.extracted_data[0].date}</TableCell>
                    <TableCell>{data?.extracted_data[0].time || "N/A"}</TableCell>
                    <TableCell>{data?.extracted_data[0].contact || "N/A"}</TableCell>
                    <TableCell>{data?.extracted_data[0].mode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}

export default App;
