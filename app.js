const cors=require("cors");
const multer = require('multer')
const express=require('express');
const app=express();
app.use(express.static('public'));
app.use(cors());
const port =process.env.PORT || 3000;


app.get("/",(req,res)=>{
  res.sendFile(__dirname+'/public/audbackend.html');
});


app.listen(port,()=>{
  console.log("Listening at",port);
});


