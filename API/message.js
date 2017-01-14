const uuidV4 = require('uuid/v4');

module.exports = function(app, message,io) {

  app.post("/message", function(req, res) {
    req.body['_id'] = uuidV4();
    message.insert(req.body, function(err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send("OK");
        io.emit("newMsg",req.body);
      }
    })

    // db.close();

  })

  app.get('/message', function(req, res) {
    message.find().toArray(function(err, result) {
      res.send(result);
    })
  })
}
