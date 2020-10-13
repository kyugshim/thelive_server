const { broadcast } = require('../models');

module.exports = (io) => {
    function emitListLiveStreamInfo() {
      return broadcast
        .findAll()
        .then(result => io.emit('list-live-stream', result))
    }

    io.on('connection', (socket) => {
      console.log('New connection');

      socket.on('list-live-stream', () => {
        return broadcast
          .findAll()
          .then(result => socket.emit('list-live-stream', result))
      })
    })
    
}