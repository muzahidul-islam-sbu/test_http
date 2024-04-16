import http from 'http';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

// Replace 'fileHash' with the actual file hash you want to download
const fileHash = 'giraffe.jpg';

// Construct the URL with the file hash as a query parameter
const url = `http://127.0.0.1:3000/requestFile?fileHash=${fileHash}`;
// Make a GET request to the server
const request = http.get(url, (response) => {
  if (response.statusCode === 200) {
    // Connect to WebSocket server
    const ws = new WebSocket('ws://127.0.0.1:3000');

    // Handle WebSocket connection open event
    ws.on('open', () => {
      console.log('WebSocket connected');
    });

    // Handle WebSocket messages
    ws.on('message', (message) => {
      if (message === 'All Chunks Sent') {
        console.log('All chunks received');
        ws.close(); // Close WebSocket connection
      } else {
        console.log(`Got Chunk: ${message}`);
        // Send confirmation message to server
        ws.send('Got Chunk');
      }
    });

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    const filenameMatch = contentDisposition.match(/filename=(.+)/);
    const filename = filenameMatch ? filenameMatch[1] : 'downloaded_file';

    // Create a writable stream to save the downloaded file
    const filePath = path.join(__dirname, `${filename}`);

    // Pipe the response stream to the file stream
    const fileStream = fs.createWriteStream(filePath);
    response.pipe(fileStream);

    // Handle stream events
    fileStream.on('finish', () => {
      console.log('File downloaded successfully');
    });
    fileStream.on('error', (err) => {
      console.error('Error downloading file:', err);
    });
  } else {
    console.error(`Error downloading file. Server responded with status code ${response.statusCode}`);
  }
});

request.on('error', (err) => {
  console.error('Error downloading file:', err);
});