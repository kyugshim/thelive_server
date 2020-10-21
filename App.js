const NodeMediaServer = require('node-media-server');
const nodeMediaServerConfig = require('./config/nodeMediaServer')
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const morgan = require('morgan');
const models = require('./models/index')
const http = require('http');
const utils = require('./utils');

const app = express();
const server = require("http").createServer(app)


const MYSQLStore = require('express-mysql-session');
const io = require("socket.io")(server)
require(`./controller/socketIO`)(io);

// find 
const passportSocketIo = require("passport.socketio");

const options = {
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '1', // database password 인가???
  database: 'theLive'
}

const sessionStore = new MYSQLStore(options)

const session = require("express-session")({
  cookieParser: app.cookieParser,
  key: 'express.sid',
  secret: "4B",
  store: sessionStore,
  resave: true,
  saveUninitialized: true
})

function onAuthorizeSuccess(data, accept) {
  console.log('successful connection to socket.io');

  // The accept-callback still allows us to decide whether to
  // accept the connection or not.

}

function onAuthorizeFail(data, message, error, accept) {
  if (error)
    throw new Error(message);
  console.log('failed connection to socket.io:', message);

  // We use this callback to log all of our failed connections.
}

const port = 5000;
const auth = require('./controller/authentication')
const controller = require('./controller/index')
const multer = require("multer");
const { pathToFileURL } = require('url');
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.filename + '-' + Date.now() +
      path.extname(file.originalname));
  }
});

const upload = multer({ dest: 'uploads/' })


models.sequelize.sync()
  .then(() => console.log('동기화 성공'))
  .catch(e => console.log(e));

require(`./controller/socketIO`)(io);


app.use(session);

io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: 'express.sid',
  secret: '4B',
  store: sessionStore,
  // success: onAuthorizeFail,
  // fail: onAuthorizeFail
}));

app.use(
  session
);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

/********** multer ************/
//user avatar
app.post('/profile', upload.single('avatar'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
})


//passport
app.use(bodyParser.urlencoded({ extended: false }))
app.use(passport.initialize())
app.use(passport.session());

/**********  API ************/

app.post('/signin', auth.signin)

//PASSPORT - OAUTH2.0 - GOOGLE
app.get('/auth/google', (req, res, next) => auth.oAuthGoogle(req, res, next))
app.get('/auth/google/redirect', auth.googleRedirect)

//PASSPORT - OAUTH2.0 - facebook
app.get('/auth/facebook', (req, res, next) => auth.oAuthfacebook(req, res, next))
app.get('auth/facebook/callback', auth.facebookCallback)

// get 요청에 대한 응답 (API)
app.get("/userInfo", controller.userInfo);
app.get("/signout", controller.signOut);


// post 요청
app.post("/signup", controller.signUp);
// app.post("/signeditnickname", controller.signEditNickname);
// app.post("/signeditpassword", controller.signEditPassword);
app.post("/additem", controller.createProduct);
app.post("/addwishlist", controller.createWishList);
app.post("/deletewishlist", controller.deleteWishList);


app.use(bodyParser.json());
app.set('socketio', io);
app.set('server', server);
app.use(express.static(`${__dirname}/public`));
app.set('port', port);
// app.listen(port, () => {
//   console.log(`app is the-live-server in PORT ${port}`);
// });
server.listen(5000, (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log('listening on port 5000')
  }
})


/*************       NodeMedia       *****************/
const nms = new NodeMediaServer(nodeMediaServerConfig);
nms.run();

nms.on('getFilePath', (streamPath, oupath, mp4Filename) => {
  console.log('---------------- get file path ---------------');
  console.log(streamPath);
  console.log(oupath);
  console.log(mp4Filename);
  utils.setMp4FilePath(`${oupath}/${mp4Filename}`);
});

nms.on('preConnect', (id, args) => {
  console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);

});

nms.on('postConnect', (id, args) => {
  console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('doneConnect', (id, args) => {
  console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('prePublish', (id, StreamPath, args) => {
  let stream_key = getStreamKeyFromStreamPath(StreamPath);
  console.log(
    '[NodeEvent on prePublish]',
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  )

});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log(
    '[NodeEvent on postPublish]',
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
});


module.exports = app, session;