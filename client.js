import express from 'express';
import fs from 'fs';
import http from 'http';

const filename = 'giraffe.jpg'
const serverUrl = `http://localhost:3000/download?file=${filename}`; // URL of the file to download
const destinationPath = `./${filename}`; // Path where the downloaded file will be saved

const fileStream = fs.createWriteStream(destinationPath);

http.get(serverUrl, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download file. Server responded with status code ${response.statusCode}`);
    return;
  }

  response.on('data', async (chunk) => {
    // Write each chunk of data to the file stream
    fileStream.write(chunk);
    console.log('recived')
    await sendConfirmation();
  });

  response.on('end', () => {
    // Close the file stream when all data has been received
    fileStream.end();
    console.log('File downloaded successfully');
  });
}).on('error', (err) => {
  console.error('Error downloading file:', err);
});


async function sendConfirmation() {
  return new Promise((resolve, reject) => {
    // Create an HTTP POST request
    const confirmationRequest = http.request(serverUrl, {
      method: 'POST',
    }, (response) => {
      if (response.statusCode === 200) {
        console.log('Confirmation message sent to server');
        resolve(); // Resolve the promise when the confirmation message is sent successfully
      } else {
        console.error(`Error sending confirmation message to server. Server responded with status code ${response.statusCode}`);
        reject(new Error(`Server responded with status code ${response.statusCode}`)); // Reject the promise if there's an error
      }
    });

    // Send the confirmation message in the request body
    confirmationRequest.write('Got Chunk');

    // End the request
    confirmationRequest.end();
  });
}