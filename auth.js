require("dotenv").config();
const { google } = require("googleapis");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const urlParse = require("url-parse");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();
const port = process.env.PORT;
const CLIENT_SECRET_ID = process.env.CLIENT_SECRET_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const redirectUri = process.env.REDIRECT_URL;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET_ID,
    redirectUri
  );
  const scopes = [
    "https://www.googleapis.com/auth/fitness.activity.read",
    "https://www.googleapis.com/auth/fitness.activity.write",
  ];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state: JSON.stringify({
      callbackUrl: req.body.callbackUrl,
      userID: req.body.userID,
    }),
  });

  request(authUrl, (err, response, body) => {
    console.log("error", err);
    console.log("statuscode", response && response.statusCode);
    res.send({ authUrl });
  });

  // res.redirect(authUrl);
});
app.get("/oauth2callback", async (req, res) => {
  const queryParse = await import("query-string");
  const queryUrl = new urlParse(req.url);
  const code = queryParse.default.parse(queryUrl.query).code;
  // .parse(queryUrl.query).code
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET_ID,
    redirectUri
  );
  const tokens = await oauth2Client.getToken(code);
 

  // *****************************
  // res.send({ tokens:tokens });
  let stepArray = [];
// -***************************************
  try {
    const result = await axios({
      method: "POST",
      headers: {
        authorization: "Bearer " + tokens.tokens.access_token
      },
      "Content-Type": "application/json",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
      data: {
        aggregateBy: [
          {
            dataTypeName: "com.google.step_count.delta",
            // dataSourceId: "derived:com.google.step_count.delta:com.google.android.fit:Xiaomi:Redmi K20 Pro:67e669d7:top_level"
            
            dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
          },
        ],
        bucketByTime:{durationMillis:86400000},
        
        startTimeMillis:1684388780000,
        endTimeMillis:1684799960000,
      },
    });
    // console.log(`Result is  ${result}`)
    stepArray=result.data.bucket
   
    
  } catch (e) {
    console.log(`error is   ${e}`);
  }

// ************************************


try{
var mySteps=[]
for(const dataSet of stepArray){
// console.log(dataSet);
for(const points of dataSet.dataset){
// console.log(points);
for(const steps of points.point)
{
  // console.log(steps.value);
  mySteps.push(steps.value)
}


}

}
console.log(mySteps);
res.send(mySteps)
return




}catch(e){
console.log(e)
}
res.send({result:stepArray})


});

app.listen(port, () => {
  console.log(`GOOGLE FIT LISTENING ON PORT  ${port}`);
});
