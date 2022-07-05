//initialize npm and install express
//set up a new express server
//serve up a public directory
//listen on port 3000
//create index.html and render chap app
const path=require('path')
const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage,generateLocationMessage}=require('./utils/message.js')
const {addUser,removeUser,getUser,getUserInRoom}=require('./utils/user.js') 
const { emit } = require('process')

const app=express()
const port=process.env.PORT ||3000
const server=http.createServer(app)
const io=socketio(server)
//now our server supports web sockets


const publicDirectoryPath=path.join(__dirname,'../public')
app.use(express.static(publicDirectoryPath))
let count=0;

io.on('connection',(socket)=>{
   
     console.log('new web socket connection')

     

    socket.on('join',(options,callback)=>{
         const{error,user}  = addUser({id:socket.id,...options})

          if(error){
           return callback(error)
          }

      socket.join(user.room)

      socket.emit('message',generateMessage('Admin','Welcome') )
      socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`))
       io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUserInRoom(user.room)

       })
      // io.emit ->io.to emit
      callback()
   })
   

    socket.on('message-send',(message,callback)=>{
      const user=getUser(socket.id)
      const filter=new Filter()
      if(filter.isProfane(message))
      {
      return  callback('profane words are not allowed')
      }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })



    socket.on('disconnect',()=>{
     const user= removeUser(socket.id)
        
     if(user){
      io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))
      io.to(user.room).emit('roomData',{room:user.room,
      users:getUserInRoom(user.room)})
     }
       
    })


  socket.on('sendLocation',(coords,callback)=>{
    const user=getUser(socket.id)
    io.to(user.room).emit('LocationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback();
  })
    
})

//app.listen
server.listen(port,()=>{
    console.log(`Server is up on port ${port}`)
})

