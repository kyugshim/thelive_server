const NodeMediaServer = require('node-media-server')
const express = require('express')
const app = express();
const http = require('http')
const fs = require('fs')
const bodyParser = require('body-parser')
const path = require('path');
const socketIO = require('./app/controllers/socketIO');
const utils = require('./app/utils')
const server = http.createServer(app);
const multer = require('multer');
const upload = multer({ dest: "uploads/" }).single("demo_image");

const io = require('socket.io').listen(server)
require(`./app/controllers/socketIO`)(io);



app.get('/', (req, res) => {
    res.sendFile('/home/sungmin/바탕화면/project/expo_practice/server/index.html')
})

app.use(bodyParser.json());
app.set('socketio', io);
app.set('server', server)
// app.user(express.static(public)) // public 루트 알아내서 적기

server.listen(5000, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('listening on port 5000')
    }
});

app.post("/image", (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(400).send("Something went wrong!");
        }
        res.send(req.file);
    });
});
const nodeMediaServerConfig = {
    rtmp: {
        port: 4000,
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
        ffmpeg: '/usr/bin/ffmpeg',
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

nms.on('donePublish', (id, StreamPath, args) => {
    console.log(
        '[NodeEvent on donePublish]',
        `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
    );
});

nms.on('prePlay', (id, StreamPath, args) => {
    console.log(
        '[NodeEvent on prePlay]',
        `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
    );
});

nms.on('postPlay', (id, StreamPath, args) => {
    console.log(
        '[NodeEvent on postPlay]',
        `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
    );
});

nms.on('donePlay', (id, StreamPath, args) => {
    console.log(
        '[NodeEvent on donePlay]',
        `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
    );
});
