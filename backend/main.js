
import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import cors from 'cors';

import { Model } from './model.js';
let model = new Model();

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

// setup for server
const PORT = process.env.PORT || 3001;
const app = express();

export let uploaded = 0;

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
  // await model.processChunksToDictionary();

  console.log(model.dictionary);

  console.log("did nothing");
  res.send("did nothing");
});

// app.get('/gettopics', async (req, res) => {
//   // const response = await model.getResponse(req.query.prompt);
//   // res.send(response);
// });

app.post('/getflashcards', async (req, res) => {
  model.setSelectedTopics(req.body.topics);
  console.log("Getting flashcards");
  const response = await model.generateFlashcards();
  console.log("Got flashcards");


  res.send(response);
});

app.post('/getquiz', async (req, res) => {
  model.setSelectedTopics(req.body.topics);
  let numMcq = req.body.numMcq;
  let numTF = req.body.numTF;
  let numSA = req.body.numSA;
  console.log("Getting quiz");
  const response = await model.generateQuiz(numMcq, numTF, numSA);
  console.log("Got quiz");

  res.send(response);
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
