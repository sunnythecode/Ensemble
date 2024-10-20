const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the 'pages' directory
app.use('/pages', express.static(path.join(__dirname, 'pages')));
