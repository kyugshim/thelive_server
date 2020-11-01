const NodeMediaServer = require('node-media-server');
const nodeMediaServerConfig = require('./config/nodeMediaServer')
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');

const morgan = require('morgan');
const models = require('./models/index')


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
  password: '',
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

const sharedsession = require('express-socket.io-session');

const upload = require('./middleware/upload');



models.sequelize.sync()
  .then(() => console.log('동기화 성공'))
  .catch(e => console.log(e));


app.use(session);

io.use(sharedsession(session, { autoSave: true }));

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());


/********** stripe start************/


app.post('/api/doPayment/', controller.dopayment);



/********** multer ************/
app.post('/profile', upload.single('avatar'), controller.postAvatarImage)
app.post('/products', upload.array('products', 5), controller.postProductImage)
app.post('/addThumbnail', upload.single('thumbnail'), controller.postThumbnailImage)
app.get('/getprofile', controller.getAvatarImage);
app.get('/getproducts', controller.getProductImage);

//passport
app.use(bodyParser.urlencoded({ extended: false }))
app.use(passport.initialize())
app.use(passport.session());

/**********  API ************/

app.post('/signin', auth.signin) // ok

//PASSPORT - OAUTH2.0 - GOOGLE
app.get('/auth/google', (req, res, next) => auth.oAuthGoogle(req, res, next)) //ok
app.get('/auth/google/redirect', auth.googleRedirect) // x session 2개 담김 (1개는 passport o, 1개는 passport x)

//PASSPORT - OAUTH2.0 - facebook
app.get('/auth/facebook', (req, res, next) => auth.oAuthfacebook(req, res, next))
app.get('auth/facebook/callback', auth.facebookCallback)

// get 요청에 대한 응답 (API)
app.get("/userInfo", controller.userInfo); //ok
app.get("/signout", controller.signOut);//ok
app.get("/myitem", controller.getMyProduct);//ok
app.get("/selleritem", controller.getSellerProduct)
app.get("/allitem", controller.getAllProduct);//ok
app.get("/myorder", controller.getOrder); // ok (product 정보포함)
app.get("/sellerorder", controller.getSellerOrder);// ok
app.get("/followlist", controller.getFollowList);// ok (반대 입장에서도 필요)
app.get("/search", controller.searchProBro);// ok (not include)
app.get("/getBroadcast", controller.getBroadcast);



// post 요청

/**** CREATE ****/
app.post("/signup", controller.signUp);// ok
app.post("/addfollow", controller.createFollow);// ok
app.post("/additem", controller.createProduct);// ok
app.post("/addwishlist", controller.createWishList);// ok
app.post("/addorder", controller.createOrder); // ok(order.addProduct(product) 가능)
app.post("/addLiveProduct", controller.createLiveProduct);

/**** UPDATE ****/
app.post("/addseller", controller.updateSeller);// ok
// app.post("/updateitem", controller.updateProduct); // 현재 필요한 기능 x 
app.post("/signedit", controller.signEdit)// ok
app.post("/sellerOrderStatus", controller.sellerOrderStatus);


/**** DELETE ****/
app.post("/deleteitem", controller.deleteProduct);
app.post("/deleteorder", controller.deleteOrder);
app.post("/deletewishlist", controller.deleteWishList);
app.post("/deletebroadcast", controller.deleteBroadcast);

app.use(bodyParser.json());
app.set('socketio', io);
app.set('server', server);
app.use(express.static(`uploads`));
app.set('port', port);


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