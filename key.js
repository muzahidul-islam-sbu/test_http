import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import crypto from 'crypto'
import fs from 'fs'
const senderAddress = '0xYourSenderAddress';
const recipientAddress = '0xRecipientAddress';
const amount = 100; // Sample amount


crypto.generateKeyPair('rsa', {
        modulusLength: 1024,
    }, async (err, publicKey, privateKey) => {
    console.log(publicKey, privateKey)
    // Sign the serialized transaction
    const signature = crypto.sign('sha256', Buffer.from(serializedTx), privateKey);
    const publicBytes = Uint8Array.from(publicKey.export({ type: 'spki', format: 'der' }));
    const privateBytes = Uint8Array.from(privateKey.export({ type: 'pkcs8', format: 'der' }));
    
    console.log('Public Key (Uint8Array):', publicBytes);
    console.log('Private Key (Uint8Array):', privateBytes);

    // Export keys to string format
    const publicKeyString = publicKey.export({ type: 'spki', format: 'pem' });
    const privateKeyString = privateKey.export({ type: 'pkcs8', format: 'pem' });

    console.log('Public Key (PEM):', publicKeyString);
    console.log('Private Key (PEM):', privateKeyString);

    
    // Raw transaction data
    const rawTx = {
      txParams: txParams,
      signature: signature.toString('hex'),
    };
    
    console.log('Raw Transaction:', rawTx);
    // Verify the signature
    const isSignatureValid = crypto.verify(
        'sha256',                    // Hashing algorithm
        Buffer.from(serializedTx),   // Data that was signed
        publicKey,                   // Public key
        signature              // Signature to verify
    );

    console.log('Is Signature Valid:', isSignatureValid);
});

function generateKeys() {
    crypto.generateKeyPair('rsa', { modulusLength: 1024 }, async (err, publicKey, privateKey) => {
        // Check for errors
        if (err) {
            console.error('Error generating key pair:', err);
            return;
        }
    
        // Export keys to PEM format
        const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' });
        const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
    
        // Save keys to files
        fs.writeFileSync('publicKey.pem', publicKeyPem);
        fs.writeFileSync('privateKey.pem', privateKeyPem);
    
        console.log('Public and private keys saved successfully.');
    });
}

function signTransaction(transaction) {
    ```
    const txParams = {
      sender: senderAddress,
      recipient: recipientAddress,
      amount: amount,
      timestamp: Date.now(), // Sample timestamp
    };
    transaction (any object) => serialized (JSON string) => buffer
    ```
    // Read the PEM files containing the keys
    const publicKeyPem = fs.readFileSync('publicKey.pem');
    const privateKeyPem = fs.readFileSync('privateKey.pem');

    // Parse the PEM strings into key objects
    const publicKey = crypto.createPublicKey(publicKeyPem);
    const privateKey = crypto.createPrivateKey(privateKeyPem);

    const serializedTransaction  = JSON.stringify(transaction);
    const bufferTransaction = Buffer.from(serializedTransaction)
    const signature = crypto.sign('sha256', bufferTransaction, privateKey);
    return signature
}

// function verifySign