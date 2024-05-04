
import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import cors from 'cors';

import { Model } from './model.js';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

// setup for server
const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors());
app.use(express.json());

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

// TODO: THIS
// app.get("/sendchatmessage", async (req, res) => {
//   const response = await model.getResponse(req.query.message);

//   res.send(response);
// });

// start processing file
app.post('/startprocessing', async (req, res) => {
  const model = new Model();

  // get text from request
  const fileName = req.body.text;
  // if file is pdf
  if (fileName.endsWith('.pdf')) {
      await model.loadPdf(`uploads/${fileName}`);
  } else if (fileName.endsWith('.txt')) {
      model.text = fs.readFileSync(`uploads/${fileName}`, 'utf8');
  } else {
      res.status(400).send('Invalid file type');
  }

  await model.splitTextIntoChunks();
  await model.processChunksToDictionary();

  // Print model dictionary keys
  console.log(model.dictionary.keys().next().value);

  res.send(model.dictionary);
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