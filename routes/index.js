const express = require('express');
const path = require('path');
const router = express.Router();
const { createClient } = require('@deepgram/sdk');
const { getRankingOfClothes } = require('../util/groq-client')

const app = express();
const env = app.get('env');
const { readFile } = require('fs');
const multer = require('multer');
const { createLogin, checkLogin, checkIdExists, uploadClothes, getClothesTypeByUserId} = require('../util/mongodb-client');
const deepgram = createClient("66d32a0950d3e2255dad552579573b58199d5f9a");


const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

router.get('/login', async function (req, res) {
  readFile('./pages/login.html', 'utf8', (err, html) => {
    if (err) {
      res.status(500).send("Sorry Out of order")
    } else {
      res.send(html)
    }

  })

});

router.post('/login', async (req, res) => {
  const { email, password } = req.body; // Extract form data

  try {
    const check = await checkLogin(email, password);
    if (check.success) {
      res.redirect(`/record/${check.userID}`);
    } else {
      res.status(401).send('Invalid email or password.');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error.');
  }
});

router.post('/signup', async (req, res) => {
  const { email, password } = req.body; // Extract form data

  try {
    const success = await createLogin(email, password);
    if (success) {
      res.redirect("/login");
    } 
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error.');
  }
});

router.get('/signup', async (req, res) => {
  readFile('./pages/signup.html', 'utf8', (err, html) => {
    if (err) {
      res.status(500).send("Sorry Out of order")
    } else {
      res.send(html)
    }
  })
});

router.get('/results', async (req, res) => {
  const t = req.query.transcript;
  const userID = req.query.userID;
  console.log(t);
  console.log(userID);

  try {
    const idExists = await checkIdExists(req.query.userID);
    if (!idExists) 
    {
      res.status(500).send('Not logged in');
    } 
    else 
    {

      // Render the Pug template with the data
      const clothes = await getRankingOfClothes(userID, t);
      res.render("results", {clothes, t, userID} );
    }
    
  } catch (error) {
    console.error('Error fetching clothes:', error);
    res.status(500).send('Error loading wardrobe');
  }
  

});

router.get('/upload/:userID', async (req, res) => {
  try {
    const idExists = await checkIdExists(req.params.userID);
    if (!idExists) 
    {
      res.status(500).send('Not logged in');
    } 
    else 
    {
      const userId = req.params.userID;
      

      // Retrieve shirts and pants from MongoDB
      const shirts = await getClothesTypeByUserId(userId, "shirt");
      const pants = await getClothesTypeByUserId(userId, "pant");

      // Render the Pug template with the data
      res.render('upload', { userId, shirts, pants });
    }
    
  } catch (error) {
    console.error('Error fetching clothes:', error);
    res.status(500).send('Error loading wardrobe');
  }
  

  // readFile('./pages/upload.html', 'utf8', (err, html) => {
  //   if (idExists) {
  //     const modifiedHtml = html.replace('<%= userId %>', req.params.userID);
  //     res.send(modifiedHtml);
  //   } else {
  //     res.status(404).json({ message: "Not logged in" });
  //   }

  // })
});

router.post('/upload-clothes', upload.fields([{ name: 'shirts[]' }, { name: 'pants[]' }]), uploadClothes);

router.post('/upload-audio', upload.single('audio'), async (req, res) => {
  if (!req.file) {
      return res.status(400).send('No audio file uploaded.');
  }

  // Create a Blob from the audio buffer
  const audioBlob = new Blob([req.file.buffer], { type: 'audio/webm' });

  //const audioFilePath = path.join(__dirname, req.file.path);
  const inputB = await audioBlob.arrayBuffer();
  // Call the Deepgram API for transcription
  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      inputB,
      {
        model: "nova-2",
      }
    );

      if (error) {
          console.error('Deepgram Error:', error);
          return res.status(500).send('Error with Deepgram API');
      }

      // Print the results
      const transcriptResult = result.results.channels[0].alternatives[0].transcript;


      // Send the transcription result back to the client
      res.json(transcriptResult);
  } catch (error) {
      console.error('Error during transcription:', error);
      res.status(500).send('Error processing audio file');
  }
});




router.get('/', (request, response) => {

  readFile('./pages/home2.html', 'utf8', (err, html) => {
    if (err) {
      response.status(500).send("Sorry Out of order")
    } else {
      response.send(html)
    }

  })

});



router.get('/record/:userID', async (req, res) => {
  const idExists = await checkIdExists(req.params.userID);
  readFile('./pages/record.html', 'utf8', (err, html) => {
    if (idExists) {
      const modifiedHtml = html.replace(
        '<a href="/upload">',
        `<a href="/upload/${req.params.userID}">`
      );
      res.send(modifiedHtml);
    } else {
      res.status(404).json({ message: "Not logged in" });
    }

  })
  
});

router.post("/")



module.exports = router;
