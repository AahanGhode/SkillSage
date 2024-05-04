const Groq = require('groq-sdk');
const dotenv = require('dotenv');
const pdf = require('pdf-parse')
const express = require("express");
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');

// setup for server
const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors());

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Define the destination folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Define the filename
  }
});
const upload = multer({ storage: storage });

// Serve the static files from the React app
app.use(express.static(path.resolve(__dirname, '../frontend/build')));

// Routes
app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.post("/startprocessing", async (req, res) => {
  // body contains the file name
  const { fileName } = req.body;
  res.send('Processing started');
  const model = new Model();
  await model.loadPdf(`uploads/${fileName}`);
  await model.splitTextIntoChunks();
  await model.processChunksToDictionary();
  res.send('Processing completed');
});

app.post('/upload', upload.single('file'), async (req, res) => {
  // File has been uploaded and saved to 'uploads/' folder
  res.send('File uploaded successfully');
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});