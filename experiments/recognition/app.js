global.__base = __dirname + '/';

var
    use_https     = true,
    argv          = require('minimist')(process.argv.slice(2)),
    https         = require('https'),
    fs            = require('fs'),
    app           = require('express')(),
    _             = require('lodash'),
    parser        = require('xmldom').DOMParser,
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
    sendPostRequest = require('request').post;


////////// EXPERIMENT GLOBAL PARAMS //////////

var researchers = ['A4SSYO0HDVD4E', 'A9AHPCS83TFFE', 'A17XT5MJVPU37V'];
//////////////////////////////////////////////

var gameport;

if(argv.gameport) {
  gameport = argv.gameport;
  console.log('using port ' + gameport);
} else {
  gameport = 8885;
  console.log('no gameport specified: using 8885\nUse the --gameport flag to change');
}

try {
  var   privateKey  = fs.readFileSync('/etc/letsencrypt/live/cogtoolslab.org/privkey.pem'), 
        certificate = fs.readFileSync('/etc/letsencrypt/live/cogtoolslab.org/cert.pem'),
        intermed    = fs.readFileSync('/etc/letsencrypt/live/cogtoolslab.org/chain.pem'),
        options     = {key: privateKey, cert: certificate, ca: intermed},
        server      = require('https').createServer(options,app).listen(gameport),
        io          = require('socket.io')(server);
} catch (err) {
  console.log("cannot find SSL certificates; falling back to http");
  var   server      = app.listen(gameport),
        io          = require('socket.io')(server);
}

app.get('/*', (req, res) => {
  serveFile(req, res);
});

io.on('connection', function (socket) {

  // write data to db upon getting current data
  socket.on('currentData', function(data) {
    console.log('currentData received: ' + JSON.stringify(data));
    // Increment games list in mongo here
    writeDataToMongo(data);
  });

  socket.on('stroke', function(data) {
    console.log('stroke data received: ' + JSON.stringify(data));
    // Increment games list in mongo here
    writeDataToMongo(data);
  });  

  socket.on('getStim', function(data) {

    console.log('this is data:',data);
    sendBatchStims(socket, data);
  });

  // upon connecting, tell the client some metainfo
  socket.emit('onConnected', {

    gameid: UUID()
  });

});

var serveFile = function(req, res) {
  var fileName = req.params[0];
  console.log('\t :: Express :: file requested: ' + fileName);
  return res.sendFile(fileName, {root: __dirname});
};

 function UUID() {
  var baseName = (Math.floor(Math.random() * 10) + '' +
        Math.floor(Math.random() * 10) + '' +
        Math.floor(Math.random() * 10) + '' +
        Math.floor(Math.random() * 10));
  var template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  var id = baseName + '-' + template.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
  return id;
};

function sendBatchStims(socket, data) {

  sendPostRequest('http://localhost:6002/db/getbatchstims', {
    json: {
      dbname: 'visual-abstraction-benchmarking_input',
      colname: 'things-128_recognition_human',
      //numTrials: 1,
      gameid: data.gameID
    }
  }, (error, res, body) => {
    if (!error && res.statusCode === 200) {

      socket.emit('stimulus', body);
    } else {
      console.log(`error getting stims: ${error} ${body}`);
      // console.log(`falling back to local stimList`);
      // socket.emit('stimulus', {
      //   stim: _.sampleSize(require('./photodraw2_meta.js'), 1)
     // });
    }
  });
}

var writeDataToMongo = function(data) {
  sendPostRequest(
    'http://localhost:6002/db/insert',
    { json: data },
    (error, res, body) => {
      if (!error && res.statusCode === 200) {
        console.log(`sent data to store`);
      } else {
	      console.log(`error sending data to store: ${error} ${body}`);
      }
    }
  );
};
