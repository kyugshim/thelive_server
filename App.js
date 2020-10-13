const  NodeMediaServer  = require('node-media-server');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const models = require('./models/index')
const http = require('http');
const utils = require('./utils');
const app = express();
const port = 5000;

const server = http.createServer(app);

const io = require('socket.io').listen(server)
require(`./controller/socketIO`)(io);

models.sequelize.sync()
    .then(() => console.log('동기화 성공'))
    .catch(e => console.log(e));


app.use(
  session({
      secret: '@4B', // 상의 후 결정
      resave: false,
      saveUninitialized: true
  })
);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(passport.initialize())
app.use(passport.session());




app.set('socketio', io);
app.set('server', server);

// app.set('port', port);
app.listen(app.get('port'), () => {
    console.log(`app is the-live-server in PORT ${app.get('port')}`);
});

const nodeMediaServerConfig = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 60,
    ping_timeout: 30,
  },
  http: {
    port: 8000,
    mediaroot: './media',
    allow_origin: '*',
  },
  trans: {
    ffmpeg: '/usr/local/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        ac: 'aac',
        mp4: true,
        mp4Flags: '[movflags=faststart]',
      },
    ],
  },
};

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
  );
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log(
    '[NodeEvent on postPublish]',
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
});

module.exports = app, session;
