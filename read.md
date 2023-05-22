require("dotenv").config()
const { google } = require('googleapis');
const express = require('express');
const cors=require('cors');
const axios=require('axios');
const urlParse=require('url-parse')
const queryParse=require('query-parse')
const bodyParser=require('body-parser')




const app = express();
const port=process.env.PORT
const CLIENT_SECRET_ID=process.env.CLIENT_SECRET_ID
const CLIENT_ID=process.env.CLIENT_ID

app.use(cors())
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())





const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET_ID,
  'http://localhost:8080/oauth2callback'
);

const scopes = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.activity.write'



];

app.get('/', (req, res) => {
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state:JSON.stringify({
      callbackUrl:req.body.callbackUrl,
      userID:req.body.userID
    })
  });

req(url,(err,response,body)=>{
  console.log("error",err)
  console.log("statuscode",response&&response.statusCode)
res.send({url})

})

  // res.redirect(authUrl);
});


app.listen(port, () => {
  console.log(`GOOGLE FIT LISTENING ON PORT  ${port}`);
});
