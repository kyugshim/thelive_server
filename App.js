const { NodeMediaServer } = require('node-media-server');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');




const app = express();
const port = 5000;

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

app.use(passport.initialize())
app.use(passport.session());

mongoose.connect('mongodb://localhost/theLive', (err) => {
  if (err) {
    console.log('....................... ERROR CONNECT TO DATABASE');
    console.log(err);
  } else {
    console.log('....................... CONNECTED TO DATABASE');
  }
});

// var db = mongoose.connection;
// db.on('error', console.error);
// db.once('open', function(){
//     // CONNECTED TO MONGODB SERVER
//     console.log("Connected to mongod server");
// });

// mongoose.connect('mongodb://localhost/mongodb_tutorial');

app.set('port', port);
app.listen(app.get('port'), () => {
    console.log(`app is listening music in PORT ${app.get('port')}`);
});

module.exports = app, session;