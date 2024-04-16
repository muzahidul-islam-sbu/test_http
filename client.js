import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

const fileHash = 'giraffe.jpg'
const serverUrl = `http://52.191.209.254:3000/requestFile?fileHash=${fileHash}`;
const payUrl = `http://52.191.209.254:3000/pay`; // URL of the file to download

import {setTimeout} from 'timers/promises';
let done = false;
let pay = 0

http.get(serverUrl, async (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download file. Server responded with status code ${response.statusCode}`);
    return;
  }
  
  // Get filename from Content-Disposition header
  const contentDisposition = response.headers['content-disposition'];
  const filenameMatch = contentDisposition.match(/filename=(.+)/);
  const filename = filenameMatch ? filenameMatch[1] : 'downloaded_file';
  const filePath = path.join(__dirname, `${filename}`);
  
  const desiredChunkSize = 1024 * 60;

  let accumulatedChunks = Buffer.alloc(0); // Buffer to accumulate partial chunks
  let totalBytesReceived = 0; // Track the total bytes received
  
  const fileStream = fs.createWriteStream(filePath);
  
  response.on('data', async (chunk) => {
      // Accumulate received chunks
      accumulatedChunks = Buffer.concat([accumulatedChunks, chunk]);
      totalBytesReceived += chunk.length;
  
      // Check if accumulated size matches the desired chunk size
      if (totalBytesReceived >= desiredChunkSize) {
          // Write accumulated chunks to the file stream
          fileStream.write(accumulatedChunks);
  
          console.log('Received chunk of size:', accumulatedChunks.length);
          sendConfirmation();
  
          // Reset accumulated chunks and total bytes received
          accumulatedChunks = Buffer.alloc(0);
          totalBytesReceived = 0;
      }
  });
  
  response.on('end', () => {
      // Write remaining accumulated chunks to the file stream
      if (accumulatedChunks.length > 0) {
          fileStream.write(accumulatedChunks);
          console.log('Received chunk of size:', accumulatedChunks.length);
      }
  
      // Close the file stream when all data has been received
      fileStream.end();
      console.log('File downloaded successfully');
      console.log('Paid', pay);
      done = true;
      sendConfirmation()
  });
  while (!done) {
    await setTimeout(100);
  }
})

async function sendConfirmation() {
  http.get(payUrl, (response) => {
    pay += 1
  });
};
