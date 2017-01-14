const ObjectId = require('mongodb').ObjectId;
module.exports = function(app, user, io) {

  io.on("connect", function(socket) {
    console.log("user connect", socket.id);

    socket.on("disconnect", function() {
      console.log("user disconnect", socket.id);
      io.emit("updateList");
      onDisconnect(socket.id);
    })
    socket.on("userConnect", function(userData) {
      console.log("listen to user connect");
      querySingleUser(userData.userId, function(result) {
        if (result) {
          console.log("userConnect", result);
          io.emit("updateList")

        }
      })

      onUserConnect(userData);
    })

  })

  app.route("/user").get(getUsers)

  app.post("/user", newUser);
  app.post("/user/update", updateUser);
  app.get("/user/single/:userId", getSingleUser);

  function getUsers(req, res) {
    user.find().toArray(function(err, result) {
      if (err) {
        res.send(err)
        return;
      }
      res.send(result);
    })
  }

  function getSingleUser(req, res) {
    //get cookie here
    user.find({
      '_id': ObjectId(req.params.userId)
    }).toArray(function(err, result) {
      if (err) {
        console.log(err);
        res.status(410).send(err)
        return;
      }

      if (result.length === 0) {
        res.status(410).send(null);
        return;
      }
      res.send(result[0]);
    })
  }

  function querySingleUser(userId, callback) {
    user.find({'_id': ObjectId(userId)}).toArray(function(err, result) {
      if (err) {
        callback(null);
        return;
      }

      if (result.length === 0) {
        callback("null");
        return;
      }
      callback(result[0]);
    })
  }

  function newUser(req, res) {
    user.insert(req.body, function(err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result.ops[0]);
      }
    })
  }

  function updateUser(req, res) {
    io.emit("updateList");
    function updateObj() {
      var obj = req.body;
      delete obj['_id'];
      return obj;
    }
    console.log("update user", req.body);
    user.update({
      '_id': ObjectId(req.body['_id'])
    }, {
      $set: updateObj()
    }, function(err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send("OK")
      }
    })
  }

  function onUserConnect(userData) {
    user.update({
      '_id': ObjectId(userData.userId)
    }, {
      $set: {
        "isOnline": true,
        "socketId": userData.socketId
      }
    }, function(err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log("user status online", userData.userId);
      }
    })
  }

  function onDisconnect(socketId) {
    user.update({
      'socketId': socketId
    }, {
      $set: {
        "isOnline": false
      }
    }, function(err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log("user offline", socketId);
      }
    })
  }

}
