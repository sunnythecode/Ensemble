const express = require('express');
const router = express.Router();

const app = express();
const env = app.get('env');
const { readFile } = require('fs');
const multer = require('multer');
const { createLogin, checkLogin, checkIdExists, uploadClothes} = require('../util/mongodb-client');

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


router.get('/upload/:userID', async (req, res) => {
  const idExists = await checkIdExists(req.params.userID);
  readFile('./pages/upload.html', 'utf8', (err, html) => {
    if (idExists) {
      const modifiedHtml = html.replace('<%= userId %>', req.params.userID);
      res.send(modifiedHtml);
    } else {
      res.status(404).json({ message: "Not logged in" });
    }

  })
});

router.post('/upload-clothes', upload.fields([{ name: 'shirts[]' }, { name: 'pants[]' }]), uploadClothes);


router.get('/', (request, response) => {

  readFile('./pages/home.html', 'utf8', (err, html) => {
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
      res.send(html);
    } else {
      res.status(404).json({ message: "Not logged in" });
    }

  })
  
});



module.exports = router;
