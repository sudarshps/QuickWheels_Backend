import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: ["https://qw-frontend.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
}); 

interface ActiveUsersType{
    userId:string;
    socketId:string;
}

let activeUsers = [] as ActiveUsersType[]

io.on("connection", (socket) => {
  // console.log('a user connected',socket.id);

  socket.on("setup", (userId) => {    
    socket.join(userId);           
    socket.emit("connected"); 
    if(!activeUsers.some((user) => user.userId === userId)){
      activeUsers.push({userId:userId,socketId:socket.id})
    }
    io.emit('get-users',activeUsers) 

  });
 
  socket.on("join chat", (room) => {
    socket.join(room);
  }); 

  socket.on("message", (message) => { 
    let chat = message.chat
      
    chat.users.forEach((user:any)=>{
        if(user === message.sender._id) return
        
        socket.in(user).emit("message received",message)
        
    })
  });

  socket.on("disconnect", () => {
    // console.log("user disconnected");
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id)
    io.emit('get-users',activeUsers)
  });

  socket.on("offline",() => { 
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id)
    io.emit('get-users',activeUsers)
  })
}); 

export { app, io, server };
