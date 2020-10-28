
/********************************************************************** */

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
    // soket 안에 session 을  넣는 코드.
    // socket.on("login", function(userdata) {
    // const user_session = socket.handshake.session.userdata
    // socket.handshake.session.save();
    // console.log(userdata)
    // console.log(user_session)
    // });

    // socket.on("logout", function(userdata) {
    //     if (socket.handshake.session.userdata) {
    //         delete socket.handshake.session.userdata;
    //         socket.handshake.session.save();
    //     }
    // });        

    socket.on('list-broadcast', () => {
      return broadcast
        .findAll()
        .then(result => socket.emit('list-broadcast', result))
    })

    /* Join live stream room */

    socket.on('join-room', (data) => {
      console.log('Join room', data);
      const { userName, title } = data;
      if (!userName || !title) return;
      socket.join(title);
    });

    socket.on('leave-room', (data) => {
      console.log('Leave room', data);
      const { userName, title } = data;
      if (!userName || !title) return;
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
        .findOrCreate({
          where: {
            userId: session_userid
          },
          defaults: {
            title: title,
            body: body,
            status: 'PR'
          }
        })
        .then(createdData => emitListBroadcastInfo())
    });

    socket.on('begin-broadcast', (data) => {
      console.log('Begin-broadcast', data);
      const session_userid = socket.handshake.session.passport.user
      const { userName, title } = data;

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
      const { userName, title } = data;

      if (!userName || !title) return;
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
      const { title = '' } = data;
      io.in(title).emit('send-heart');
    });

    /*** messages의 userName과 message를 세트로 어떻게 넣어줘야 하는가 ?? ***/
      socket.on('send-message', (data) => {
      console.log('Send message');
      const  { nickName, message , title} = data;
      const session_userid = socket.handshake.session.passport.user;

        const chat = [nickName, message]
       return io.in(title).emit('send-message', chat)});
       }
    /*** 저장한 동영상을 어떻게 볼지***/
    // socket.on('replay', (data) => {
    //   console.log('Replay video');
    //   const { roomName, userName } = data;
    //   Room.findOne({ roomName }).exec((error, result) => {
    //     socket.emit('replay', result);
    //     const { filePath } = result;
    //     const commandExec = `ffmpeg -re -i ${filePath} -c:v libx264 -preset superfast -maxrate 3000k -bufsize 6000k -pix_fmt yuv420p -g 50 -c:a aac -b:a 160k -ac 2 -ar 44100 -f flv rtmp://localhost/live/${roomName}/replayFor${userName}`;
    //     console.log('Command execute : ', commandExec);
    //     exec(commandExec, (err, stdout, stderr) => {
    //       if (error) {
    //         console.log(`error: ${error.message}`);
    //         return;
    //       }
    //       if (stderr) {
    //         console.log(`stderr: ${stderr}`);
    //         return;
    //       }
    //       console.log(`stdout: ${stdout}`);
    //     });

  )}