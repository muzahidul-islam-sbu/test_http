import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// Endpoint to handle file download
app.get('/requestFile', (req, res) => {
  // Parse file hash from the query parameter
  const fileHash = req.query.fileHash;

  if (!fileHash) {
    // If file hash is not provided
    return res.status(400).send('File hash is required');
  }

  // Assuming your files are stored in a directory called 'files'
  const filePath = path.join(__dirname, 'files', fileHash);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found
      return res.status(404).send('File not found');
    }

    // Get file stats to know its size
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    // Set response headers
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename=${fileHash}`,
      'Content-Length': fileSize
    });

    // Create read stream to read file in chunks
    const fileStream = fs.createReadStream(filePath);

    // Stream file data to response in chunks
    fileStream.pipe(res);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});