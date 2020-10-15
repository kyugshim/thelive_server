const { broadcast } = require('../models');

module.exports = (io) => {
    function emitListLiveStreamInfo() {
      return broadcast
        .findAll()
        .then(result => io.emit('list-live-stream', result))
    }

     /* Get list live stream information */

    io.on('connection', (socket) => {
      console.log('New connection');

      socket.on('list-live-stream', () => {
        return broadcast
          .findAll()
          .then(result => socket.emit('list-live-stream', result))
      })

      /* Join live stream room */

      socket.on('join-room', (data) => {
        console.log('Join room', data);
        const { userName, roomName } = data;
        if (!userName || !roomName) return;
        socket.join(roomName);
      });

      socket.on('leave-room', (data) => {
        console.log('Leave room', data);
        const { userName, roomName } = data;
        if (!userName || !roomName) return;
        socket.leave(roomName);
      });

      socket.on('prepare-live-stream', (data) => {
        console.log('Prepare live stream', data);
        const { userName, title, body } = data;

        broadcast
              .findOrCreate({
                where: {
                  userId :session_userid 
                },
                defaults: {
                  title: title,
                  body: body,
                  status: 'PR'
                }
                .then(createdData => emitListLiveStreamInfo())
      
      })
      })
})
}