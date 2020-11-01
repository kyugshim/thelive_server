
const { broadcast } = require('../models')

module.exports = (io) => {

  function emitListBroadcastInfo() {
    return broadcast
      .findAll()
      .then(result => io.emit('list-broadcast', result))
  }

  /* Get list live stream information */

  io.on("connection", function (socket) {
    console.log('New connection');

    socket.on('list-broadcast', () => {
      return broadcast
        .findAll()
        .then(result => socket.emit('list-broadcast', result))
    })

    /* Join live stream room */

    socket.on('join-room', (data) => {
      console.log('Join room', data);
      const { nickName, title } = data;
      if (!nickName || !title) return;
      socket.join(title);
    });

    socket.on('leave-room', (data) => {
      console.log('Leave room', data);
      const { nickName, title } = data;
      if (!nickName || !title) return;
      socket.leave(title);
    });

    socket.on('prepare-broadcast', (data) => {
      console.log('Prepare-broadcast', data);
      const { title, body } = data;
      socket.handshake.session.save();
      console.log(socket.handshake.session)
      const session_userid = socket.handshake.session.passport.user
      console.log(session_userid)
      broadcast
        .create({
            title: title,
            body: body,
            status: 'PR',
            userId: session_userid
        })
        .then(createdData =>
           emitListBroadcastInfo())
    });

    socket.on('begin-broadcast', (data) => {
      console.log('Begin-broadcast', data);
      const session_userid = socket.handshake.session.passport.user
      const {  title } = data;

      return broadcast.update(
        { status: 'ON' }, { where: { userId: session_userid } }
      ).then((foundRoom) => {
        if (foundRoom) {
          io.in(title).emit('begin-broadcast', foundRoom);
          return emitListBroadcastInfo();
        }
      })
    });

    socket.on('done-broadcast', (data) => {
      console.log('Done-broadcast');
      const session_userid = socket.handshake.session.passport.user
      const { nickName, title } = data;

      if (!nickName || !title) return;
      return broadcast.update(
        { status: "END" }, { where: { userId: session_userid } }
      ).then((updatedData) => {
        io.in(title).emit('done-broadcast', updatedData);
        socket.leave(title);
        return emitListBroadcastInfo();
      })
    });

    socket.on('send-heart', (data) => {
      console.log('Send heart');
      const { title } = data;
      io.in(title).emit('send-heart');
    });

    /*** messages의 nickName과 message를  ***/
      socket.on('send-message', (data) => {
      console.log('Send message');
      const  { nickName, message , title} = data;
      const session_userid = socket.handshake.session.passport.user;

        const chat = [nickName, message]
       return io.in(title).emit('send-message', chat)});
       }

  )}