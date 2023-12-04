global.__base = __dirname + '/';

var
  use_https = true,
  argv = require('minimist')(process.argv.slice(2)),
  https = require('https'),
  fs = require('fs'),
  app = require('express')(),
  _ = require('lodash'),
  parser = require('xmldom').DOMParser,
  XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
  sendPostRequest = require('request').post,
  cors = require('cors');

////////// EXPERIMENT GLOBAL PARAMS //////////

var gameport;
var researchers = ['A4SSYO0HDVD4E', 'A9AHPCS83TFFE'];
var blockResearcher = false;

if (argv.gameport) {
  gameport = argv.gameport;
  console.log('using port ' + gameport);
} else {
  gameport = 8875;
  console.log('no gameport specified: using 8886\nUse the --gameport flag to change');
}

try {
  var privateKey = fs.readFileSync('/etc/letsencrypt/live/cogtoolslab.org/privkey.pem'),
    certificate = fs.readFileSync('/etc/letsencrypt/live/cogtoolslab.org/cert.pem'),
    intermed = fs.readFileSync('/etc/letsencrypt/live/cogtoolslab.org/chain.pem'),
    options = {
      key: privateKey,
      cert: certificate,
      ca: intermed
    },
    server = require('https').createServer(options, app).listen(gameport),
    io = require('socket.io')(server);
} catch (err) {
  console.log("cannot find SSL certificates; falling back to http");
  var server = app.listen(gameport),
    io = require('socket.io')(server);
}

// serve stuff that the client requests
app.get('/*', (req, res) => {
  serveFile(req, res);
});

io.on('connection', function(socket) {

  // set up trial list for participant
  initializeWithTrials(socket);

  // write data to db upon getting current data
  socket.on('currentData', function(data) {
    console.log('currentData received: ' + JSON.stringify(data));
    // Increment games list in mongo here
    writeDataToMongo(data);
  });

});

FORBIDDEN_FILES = ["auth.json"]

var serveFile = function(req, res) {
  var fileName = req.params[0];
  if(FORBIDDEN_FILES.includes(fileName)){
    // Don't serve files that contain secrets
    console.log("Forbidden file requested:" + filename);
    return; 
  }
  console.log('\t :: Express :: file requested: ' + fileName);
  return res.sendFile(fileName, {root: __dirname});
};

var handleDuplicate = function(socket) {
  console.log("duplicate id: blocking request");
  socket.emit('redirect', '/duplicate.html');
};

var valid_id = function(id) {
  return (id.length <= 15 && id.length >= 12) || id.length == 41;
};

var handleInvalidID = function(socket) {
  console.log("invalid id: blocking request");
  socket.emit('redirect', '/invalid.html');
};

function checkPreviousParticipant(workerId, callback) {
  var p = {
    'workerId': workerId
  };
  var postData = {
    dbname: 'thingsdraw128_16',
    query: p,
    projection: {
      '_id': 1
    }
  };
  sendPostRequest(
    'http://localhost:8051/db/exists', {
      json: postData
    },
    (error, res, body) => {
      try {
        if (!error && res.statusCode === 200) {
          console.log("success! Received data " + JSON.stringify(body));
          callback(body);
        } else {
          throw `${error}`;
        }
      } catch (err) {
        console.log(err);
        console.log('no database; allowing participant to continue');
        return callback(false);
      }
    }
  );
};


function initializeWithTrials(socket) {
  var gameid = UUID();
  var colname = 'thingsdraw128_16';
  sendPostRequest('http://localhost:8051/db/getbatchstims', {
    json: {
      dbname: 'stimuli',
      colname: colname,
      //numTrials: 1,
      gameid: gameid
    }
  }, (error, res, body) => {
    if (!error && res.statusCode === 200) {
      // send trial list (and id) to client
      var packet = {
        gameid: gameid,
        meta: body.meta,
        version: body.experimentVersion
      };
      socket.emit('onConnected', packet);
    } else {
      console.log(`error getting stims: ${error} ${body}`);
    }
  });
}

var UUID = function() {
  var baseName = (Math.floor(Math.random() * 10) + '' +
    Math.floor(Math.random() * 10) + '' +
    Math.floor(Math.random() * 10) + '' +
    Math.floor(Math.random() * 10));
  var template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  var id = baseName + '-' + template.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return id;
};


var writeDataToMongo = function(data) {
  sendPostRequest(
    'http://localhost:8051/db/insert', {
      json: data
    },
    (error, res, body) => {
      if (!error && res.statusCode === 200) {
        console.log(`sent data to store`);
      } else {
        console.log(`error sending data to store: ${error} ${body}`);
      }
    }
  );
};
