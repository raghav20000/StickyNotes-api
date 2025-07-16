require('dotenv').config();
const express=require("express");
const app=express();
const path=require("path");
const {logger}=require('./middleware/logger');
const errorHandler=require('./middleware/errorHandling')
const cookieParser=require('cookie-parser')
const corsOptions=require('./config/corsOptions')
const cors=require('cors')
const connectDB=require('./config/dbConn')
const mongoose=require('mongoose')
const {logEvent}=require('./middleware/logger')
const port=process.env.PORT ||3500;

console.log(process.env.NODE_ENV)

connectDB()

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json());

app.use(cookieParser())

app.use('/',express.static(path.join(__dirname,'public')));

app.use('/',require('./routes/root.js'));

app.use('/auth',require('./routes/authRoutes.js'))
app.use('/users',require('./routes/userRoutes.js'))
app.use('/notes',require('./routes/noteRoutes.js'))

app.all('/aaa',(req,res)=>{
  res.status(404)
  if(req.accepts('html')){
    res.sendFile(path.join(__dirname,'views','404.html'))
  }
  else if(req.accepts('json')){
    res.json({message:"404 Not Found"})
  }else{
    res.type('txt').send("404 Not Found");
  }
})

app.use(errorHandler)

mongoose.connection.once('open',()=>{
  console.log("Conneted to MongoDB");
  app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
  })
})
mongoose.connection.on('err',err=>{
  console.log(err);
  logEvent(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErr.log')
})