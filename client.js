import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

const fileHash = 'fragment_04_20240401231240.mp4'
const serverUrl = `http://127.0.0.1:3000/requestFile?fileHash=${fileHash}`;
const payUrl = `http://127.0.0.1:3000/pay`; // URL of the file to download

import {setTimeout} from 'timers/promises';
let done = false;

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
  
  const fileStream = fs.createWriteStream(filePath);

  response.on('data', async (chunk) => {
    // Write each chunk of data to the file stream
    fileStream.write(chunk);
    console.log('recived')
    sendConfirmation();
  });

  response.on('end', () => {
    // Close the file stream when all data has been received
    fileStream.end();
    console.log('File downloaded successfully');
    done = true
  });
  while (!done) {
    await setTimeout(100);
  }
})

async function sendConfirmation() {
  http.get(payUrl, (response) => {
  });
};
