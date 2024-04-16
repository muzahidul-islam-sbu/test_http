import express from 'express';
import fs from 'fs';
import {setTimeout} from 'timers/promises';


const app = express();
const PORT = process.env.PORT || 3000;

let payments = 0;
let payed = true;
// Endpoint to handle file download
app.get('/download', (req, res) => {
  // Assuming your file is located at './file.txt'
  const filePath = './files/' + req.query.file;

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    console.log(filePath)
    return res.status(404).send('File not found');
  }

  // Open the file for reading synchronously
  const fileHandle = fs.openSync(filePath, 'r');

  // Buffer size for each chunk (you can adjust this value as needed)
  const bufferSize = 1024 * 60; // 1 KB

  // Buffer to store chunk data
  const buffer = Buffer.alloc(bufferSize);

  // Function to read chunks from the file and write them to the response stream
  const readChunk = async () => {
    while (!payed) {
      await setTimeout(100);
    }

    // Read data from the file into the buffer
    const bytesRead = fs.readSync(fileHandle, buffer, 0, bufferSize, null);

    // If bytesRead is 0, it means we've reached the end of the file
    if (bytesRead === 0) {
      // Close the file handle
      fs.closeSync(fileHandle);
      console.log(payments)
      // End the response
      return res.end();
    }

    console.log('sent')
    // Write the chunk data to the response stream
    res.write(buffer.slice(0, bytesRead));

    payed = false;
    // Read the next chunk recursively
    process.nextTick(readChunk);
  };

  // Start reading chunks from the file
  readChunk();
});

app.post('/download', (req, res) => {
  payments += 1;
  payed = true
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
