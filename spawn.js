const spawn = require('child_process').spawn,
    nodeMediaServerConfig = require('./config/nodeMediaServer'),
    cmd = nodeMediaServerConfig.rtmp_server.trans.ffmpeg;
 
const generateStreamThumbnail = (stream_key) => {
    const args = [
        '-y',
        '-i', 'http://localhost:3000/live/'+stream_key+'/index.m3u8',
        '-ss', '00:00:01',
        '-vframes', '1',
        '-vf', 'scale=-2:300',
        'server/thumbnails/'+stream_key+'.png',
    ];
 
    spawn(cmd, args, {
        detached: true,
        stdio: 'ignore'
    }).unref();
};
 
module.exports = {
    generateStreamThumbnail : generateStreamThumbnail
};