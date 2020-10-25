const NodeMediaServer = require('node-media-server');
const nodeMediaServerConfig = require('./config/nodeMediaServer')
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');

const path = require('path');
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

const options = {
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '[144leader!]', // database password 인가???
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

const port = 5000;
const auth = require('./controller/authentication');
const controller = require('./controller/index');
const { pathToFileURL } = require('url');

const sharedsession = require('express-socket.io-session');

const upload = require('./middleware/upload');


models.sequelize.sync()
  .then(() => console.log('동기화 성공'))
  .catch(e => console.log(e));

require(`./controller/socketIO`)(io);


app.use(session);

io.use(sharedsession(session,{
  autoSave:true
}));

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

/********** multer ************/
//user avatar
app.post('/profile', upload.single('avatar'), async (req, res) => {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  console.log();
  try {
    const avatar = req.file;

    // make sure file is available
    if (!avatar) {
      res.status(400).send({
        status: false,
        data: 'No file is selected.'
      });
    } else {
      // send response
      res.status(200).send({
        status: true,
        message: 'File is uploaded.',
        data: {
          originalname: avatar.originalname,
          encoding: avatar.encoding,
          mimetype: avatar.mimetype,
          destination: avatar.destination,
          filename: avatar.filename,
          path: avatar.path,
          size: avatar.size
        }
      });
    }

  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/products', upload.array('products', 5), async (req, res) => {
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
  console.log();
  try {
    const products = req.files;

    // make sure file is available
    if (!products) {
      res.status(400).send({
        status: false,
        data: 'No file is selected.'
      });
    } else {
      // send response
      let data = [];

      products.map(p => data.push({
        originalname: p.originalname,
        encoding: p.encoding,
        mimetype: p.mimetype,
        destination: p.destination,
        filename: p.filename,
        path: p.path,
        size: p.size
      }));
      res.status(200).send({
        status: true,
        message: 'File is uploaded.',
        data: data
      });
    }

  } catch (err) {
    res.status(500).send(err);
  }
});


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
app.get("/myitem", controller.getMyProduct);
app.get("/allitem", controller.getAllProduct);
app.get("/myorder", controller.getOrder);
app.get("/followlist", controller.getFollowList)
app.get("/search", controller.searchProBro);

// post 요청

/**** CREATE ****/
app.post("/signup", controller.signUp);
app.post("/additem", controller.createProduct);
app.post("/addwishlist", controller.createWishList);
app.post("/addorder", controller.createOrder);
app.post("/addfollow", controller.createFollow);


/**** UPDATE ****/
app.post("/updateitem", controller.updateProduct);
app.post("/signedit", controller.signEdit)
app.post("/addseller", controller.updateIsSeller);

/**** DELETE ****/
app.post("/deletewishlist", controller.deleteWishList);
app.post("/deleteitem", controller.deleteProduct);
app.post("/deleteorder", controller.deleteOrder);
app.post("/deletebroadcast", controller.deleteBroadcast);

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
    console.log(`listening on port ${port}`)
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