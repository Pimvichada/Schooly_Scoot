const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
// You MUST provide serviceAccountKey.json or set GOOGLE_APPLICATION_CREDENTIALS
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin Initialized");
} catch (error) {
  console.error("Error initializing Firebase Admin:", error.message);
  console.error("Please ensure 'serviceAccountKey.json' is present in the server directory.");
}

// Mock Database for Tokens (In production, use MongoDB/MySQL)
// Format: { userId: "token_string" }
const userTokens = {};

// 1. Save Token Endpoint
app.post('/save-token', (req, res) => {
  const { userId, token } = req.body;
  if (!userId || !token) {
    return res.status(400).send({ error: 'Missing userId or token' });
  }

  userTokens[userId] = token;
  console.log(`Token saved for user ${userId}: ${token.substring(0, 20)}...`);
  res.send({ success: true, message: 'Token saved' });
});

// 2. Send Notification Endpoint
app.post('/send-notification', async (req, res) => {
  const { userId, title, body } = req.body;

  const token = userTokens[userId];
  if (!token) {
    return res.status(404).send({ error: 'User token not found' });
  }

  const message = {
    notification: {
      title: title || 'New Notification',
      body: body || 'You have a new message!'
    },
    token: token
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    res.send({ success: true, messageId: response });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send({ error: 'Failed to send notification', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
