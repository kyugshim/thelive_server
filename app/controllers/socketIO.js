const { Room } = require('../../models')
const Utils = require('../utils');
const LiveStatus = require('../liveStatus');

module.exports = (io) => {
  function emitListLiveStreamInfo() {
    return Room
      .findAll()
      .then(result => io.emit('list-live-stream', result))
  }

  io.on('connection', (socket) => {
    console.log('New connection');

    /**
     * Get list live stream information
     */
    socket.on('list-live-stream', () => {
      return Room
        .findAll()
        .then(result => socket.emit('list-live-stream', result))
    })

    /**
     * Join live stream room
     */

    socket.on('join-room', (data) => {
      console.log('Join room', data);
      const { userName, roomName } = data;
      if (!userName || !roomName) return;
      socket.join(roomName);
    });

    /**
     * Leave live stream room
     */
    socket.on('leave-room', (data) => {
      console.log('Leave room', data);
      const { userName, roomName } = data;
      if (!userName || !roomName) return;
      socket.leave(roomName);
    });

    /**
     * The host join the room and prepare live stream
     */
    socket.on('prepare-live-stream', (data) => {
      console.log('Prepare live stream', data);
      const { userName, roomName } = data;
      if (!userName || !roomName) return;
      return Room.update({
        liveStatus: LiveStatus.PREPARE
      },
        {
          where: {
            userName: userName,
            roomName: roomName
          }
        }).then(
          Room
            .findOne({
              where: {
                userName: userName,
                roomName: roomName
              }
            })
        ).then(result => {
          const condition = {
            userName,
            roomName,
            liveStatus: LiveStatus.PREPARE,
          };
          Room.create(condition)
            .then(createdData => emitListLiveStreamInfo())
        })
    });

    /**
     * When user begin live stream
     */
    socket.on('begin-live-stream', (data) => {
      console.log('Begin live stream', data);
      const { userName, roomName } = data;
      if (!userName || !roomName) return;

      return Room.update({
        liveStatus: LiveStatus.ON_LIVE
      },
        {
          where: {
            userName: userName,
            roomName: roomName
          }
        }).then(
          Room
            .findOne({
              where: {
                userName: userName,
                roomName: roomName
              }
            })
        )
        .then(foundRoom => {
          io.in(roomName).emit('begin-live-stream', foundRoom)
          return emitListLiveStreamInfo()
        })
        .then(() => {
          const condition = {
            userName,
            roomName,
            liveStatus: LiveStatus.PREPARE,
          };
          Room
            .create(condition)
            .then(createdData => {
              io.in(roomName).emit('begin-live-stream', createdData);
              emitListLiveStreamInfo()
            })
        })
    });

    /**
     * When user finish live stream action
     */
    socket.on('finish-live-stream', (data) => {
      console.log('Finish live stream');
      const { userName, roomName } = data;
      const filePath = Utils.getMp4FilePath();
      if (!userName || !roomName) return;
      return Room
        .update({ liveStatus: LiveStatus.FINISH, filePath }, {
          where: {
            userName: userName,
            roomName: roomName
          }
        })
        .then(() =>
          Room.findOne({
            where: {
              userName: userName,
              roomName: roomName
            }
          }).then(foundRoom => {
            io.in(roomName).emit('finish-live-stream', foundRoom);
            socket.leave(roomName);
            return emitListLiveStreamInfo();
          })
        )
    })

    /**
     * User send heart to room
     */
    socket.on('send-heart', (data) => {
      console.log('Send heart');
      const { roomName = '' } = data;
      io.in(roomName).emit('send-heart');
    });

    /**
     * User send message to room
     */
    socket.on('send-message', (data) => {
      console.log('Send message');
      const { roomName = '', message, userName } = data;
      return Room
        .update(
          { messages: message },
          {
            where: {
              roomName: roomName
            }
          })
        .then(updatedData => io.in(roomName).emit('send-message', updatedData))
    });

    /**
     * Try to replay video
     */
    socket.on('replay', (data) => {
      console.log('Replay video');
      const { roomName, userName } = data;
      Room
        .findOne({
          where: {
            roomName: roomName
          }
        })
        .then(result => {
          socket.emit('replay', result);
          const { filePath } = result;
          const commandExec = `ffmpeg -re -i ${filePath} -c:v libx264 -preset superfast -maxrate 3000k -bufsize 6000k -pix_fmt yuv420p -g 50 -c:a aac -b:a 160k -ac 2 -ar 44100 -f flv rtmp://localhost/live/${roomName}/replayFor${userName}`;
          console.log('Command execute : ', commandExec)
        })
    })
  })
}