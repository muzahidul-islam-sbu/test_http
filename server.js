import express from 'express';
import fs from 'fs';
import {setTimeout} from 'timers/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));


const app = express();
const PORT = process.env.PORT || 3000;

let payments = 0;
let payed = true;
// Endpoint to handle file download
app.get('/requestFile', async (req, res) => {
  // Parse file hash from the query parameter
  const fileHash = req.query.fileHash;
  if (!fileHash) {
    // If file hash is not provided
    return res.status(400).send('File hash is required');
  }
  // Assuming your files are stored in a directory called 'files'
  const filePath = path.join(__dirname, 'files', fileHash);
  // Open the file for reading synchronously
  const fileHandle = fs.openSync(filePath, 'r');

  // Get file stats to know its size
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  // Set response headers
  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename=${fileHash}`,
    'Content-Length': fileSize
  });
  
  // Buffer size for each chunk (you can adjust this value as needed)
  const bufferSize = 1024 * 60; 
  // Buffer to store chunk data
  const buffer = Buffer.alloc(bufferSize);

  // Function to read chunks from the file and write them to the response stream
  while (true) {
    while (!payed) {
      await setTimeout(100);
      console.log('waiting for pay')
    }
    
    let bytesRead;
    let bytesProcessed = 0; // Track the total bytes processed
    let endOfFile = false; // Flag to indicate end of file
    let remainingBytes = bufferSize;
    while (remainingBytes > 0) {
      bytesRead = fs.readSync(fileHandle, buffer, bytesProcessed, remainingBytes, null);
      if (bytesRead === 0) {
        endOfFile = true; // Set endOfFile flag to true
        break; // Exit inner loop if end of file
      }
      remainingBytes -= bytesRead;
      bytesProcessed += bytesRead;
    }
    
    console.log('sent chunk')
    res.write(buffer.slice(0, bytesProcessed)); // Write the chunk data to the response stream
    payed = false;

    // If bytesRead is 0, it means we've reached the end of the file
    if (endOfFile) {
      // Close the file handle
      fs.closeSync(fileHandle);
      console.log(payments)
      // End the response
      res.end();
      break
    }

  };
});

app.get('/pay', (req, res) => {
  console.log('payed')
  payments += 1;
  payed = true
  res.setHeader('Connection', 'close');
  res.end();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
