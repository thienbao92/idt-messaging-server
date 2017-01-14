const http = require('http');
const express = require('express')
const port = process.env.PORT || 3000;

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const bodyParser = require('body-parser');
const messageAPI = require('./API/message');
const userAPI = require('./API/user');
const uuidV4 = require('uuid/v4');

const dbURL = 'mongodb://admin:admin@ds159988.mlab.com:59988/idtmessaging';
app.use(bodyParser());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Credentials', true);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, auth-token,cookie");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS,PUT");
  res.header("Access-Control-Allow-Headers: Content-Type, *");
  (req.method === 'OPTIONS')
    ? res.sendStatus(200)
    : next();
});
app.use(express.static(path.resolve(__dirname, 'build')))
MongoClient.connect(dbURL, function(err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
    return;
  }
  var message = db.collection('message');
  var user = db.collection('users');

  messageAPI(app, message, io);
  userAPI(app, user, io);

  //Close connection
  // db.close();

});

server.listen(port, function() {
  console.log('Example app listening on port 3000!')
})
