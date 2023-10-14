const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const listEndpoints = require('express-list-endpoints');
require('dotenv').config();
var searchRouter = require('./routes/search');

const app = express();

app.use(logger('dev'));

app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: false }));

// CORS is enabled for all origins
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser())

//routes
app.use('/', searchRouter);

const port = process.env.PORT || 9100;

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
});

console.log(listEndpoints(app));