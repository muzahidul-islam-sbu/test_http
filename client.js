import express from 'express';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

// Replace 'fileHash' with the actual file hash you want to download
const fileHash = 'test.txt';

// Construct the URL with the file hash as a query parameter
const url = `http://127.0.0.1:3000/requestFile?fileHash=${fileHash}`;

// Make a GET request to the server
http.get(url, (response) => {
  // Check if the response status code is OK (200)
  if (response.statusCode === 200) {
    // Create a writable stream to save the downloaded file
    const filePath = path.join(__dirname, 'downloaded_file');

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
}).on('error', (err) => {
  console.error('Error downloading file:', err);
});
