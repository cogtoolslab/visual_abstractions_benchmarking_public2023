'use strict';

const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const mongodb = require('mongodb');
const path = require('path');
const sendPostRequest = require('request').post;
const colors = require('colors/safe');

const app = express();
const ObjectID = mongodb.ObjectID;
const MongoClient = mongodb.MongoClient;
const port = 6005; //6000
const mongoCreds = require('./auth.json');
const mongoURL = `mongodb://${mongoCreds.user}:${mongoCreds.password}@localhost:27017/`;
const handlers = {};

function makeMessage(text) {
  return `${colors.blue('[store]')} ${text}`;
}

function log(text) {
  console.log(makeMessage(text));
}

function error(text) {
  console.error(makeMessage(text));
}

function failure(response, text) {
  const message = makeMessage(text);
  console.error(message);
  return response.status(500).send(message);
}

function success(response, text) {
  const message = makeMessage(text);
  console.log(message);
  return response.send(message);
}

function mongoConnectWithRetry(delayInMilliseconds, callback) {
  MongoClient.connect(mongoURL, (err, connection) => {
    if (err) {
      console.error(`Error connecting to MongoDB: ${err}`);
      setTimeout(() => mongoConnectWithRetry(delayInMilliseconds, callback), delayInMilliseconds);
    } else {
      log('connected succesfully to mongodb');
      callback(connection);
    }
  });
}

function markAnnotation(collection, gameid, sketchid) {
  collection.update({_id: ObjectID(sketchid)}, {
    $push : {games : gameid},
    $inc  : {numGames : 1}
  }, function(err, items) {
    if (err) {
      console.log(`error marking annotation data: ${err}`);
    } else {
      console.log(`successfully marked annotation. result: ${JSON.stringify(items)}`);
    }
  });
};


function incTimesShown(collection, gameid, batchID) {

  collection.update({_id: ObjectID(batchID)}, {
    $push : {games : gameid},
    $inc  : {numGames : 1}
  }, function(err, items) {
    if (err) {
      console.log(`error updating counts: ${err}`);
    } else {
      console.log(`successfully updated counts. result: ${JSON.stringify(items)}`);
    }
  });
};


function serve() {

  mongoConnectWithRetry(2000, (connection) => {

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true}));

    app.post('/db/insert', (request, response) => {
      if (!request.body) {
        return failure(response, '/db/insert needs post request body');
      }

      console.log(`got request to insert into ${request.body.colname}`);
      console.log(`the db  name is ${request.body.object}`);

      const databaseName = request.body.dbname;
      
      const collectionName = request.body.colname;
      if (!collectionName) {
        
        return failure(response, '/db/insert needs collection');
      }
      if (!databaseName) {
        return failure(response, '/db/insert needs database');
      }

      const database = connection.db(databaseName);

      // Add collection if it doesn't already exist
      if (!database.collection(collectionName)) {
        console.log('creating collection ' + collectionName);
        database.createCollection(collectionName);
      }

      const collection = database.collection(collectionName);

      const data = _.omit(request.body, ['colname', 'dbname']);
      // log(`inserting data: ${JSON.stringify(data)}`);
      collection.insert(data, (err, result) => {
        if (err) {
          return failure(response, `error inserting data: ${err}`);
        } else {
          return success(response, `successfully inserted data. result: ${JSON.stringify(result)}`);
        }
      });
    });


    app.post('/db/getsinglestim', (request, response) => {
      if (!request.body) {
        return failure(response, '/db/getsinglestim needs post request body');
      }
      console.log(`got request to get stims from ${request.body.dbname}/${request.body.colname}`);

      const databaseName = request.body.dbname;
      const collectionName = request.body.colname;
      if (!collectionName) {
        return failure(response, '/db/getsinglestim needs collection');
      }
      if (!databaseName) {
        return failure(response, '/db/getsinglestim needs database');
      }

      const database = connection.db(databaseName);
      const collection = database.collection(collectionName);

      // sort by number of times previously served up and take the first
      collection.aggregate([
        { $addFields : { numGames: { $size: '$games'} } },
        { $sort : {numGames : 1} }, // , shuffler_ind: 1
        { $limit : 1}
        ]).toArray( (err, results) => {
        if(err) {
          console.log(err);
        } else {
    	    // Immediately mark as annotated so others won't get it too
    	    markAnnotation(collection, request.body.gameid, results[0]['_id']);
          response.send(results[0]);
        }
      });
    });


    app.post('/db/getbatchstims', (request, response) => {
      if (!request.body) {
        return failure(response, '/db/getbatchstims needs post request body');
      }
      //console.log(`got request to get stims from ${request.body.dbname}/${request.body.colname}`);
     console.log(`got request to get gameid from ${request.body.gameid}`);


      const databaseName = request.body.dbname;
      const collectionName = request.body.colname;
      var games = request.body.gameid;
      if (!collectionName) {
        return failure(response, '/db/getbatchstims needs collection');
      }
      if (!databaseName) {
        return failure(response, '/db/getbatchstims needs database');
      }

      const database = connection.db(databaseName);
      const collection = database.collection(collectionName);

      // sort by number of times previously served up and take the first
    //   collection.aggregate([
    //     { $addFields : { numGames: { $size: '$games'} } },
    //     { $sort : {numGames : 1} },
    //     { $limit : 1}
    //     ]).toArray( (err, results) => {
    //     if(err) {
    //       console.log(err);
    //     } else {
	  // // Immediately mark as annotated so others won't get it too
    //       markAnnotation(collection, request.body.gameid, results[0]['_id']);
    //       response.send(results[0]);
    //     }
    //   }); 
 
    collection.aggregate([
     { $addFields : { numGames: { $size: {"$ifNull": [ "$games", [] ]} }} }, 
     { $sort : {numGames : 1} },
       { $limit : 1}
       ]).toArray( (err, results) => {
          if(err) {
            console.log(err);
          } else {
            
            incTimesShown(collection, request.body.gameid, results[0]['_id']);
            response.send(results[0]);
          }});
	
    });

    app.post('/db/exists', (request, response) => {            
      if (!request.body) {
        return failure(response, '/db/exists needs post request body');
      }
      const databaseName = request.body.dbname;
      const database = connection.db(databaseName);
      const query = request.body.query;
      const projection = request.body.projection;
      // hardcoded for now (TODO: get list of collections in db)
      var collectionList = ['machines']; 
      function checkCollectionForHits(collectionName, query, projection, callback) {
        const collection = database.collection(collectionName);        
        collection.find(query, projection).limit(1).toArray((err, items) => {          
          callback(!_.isEmpty(items));
        });  
      }
      function checkEach(collectionList, checkCollectionForHits, query,
       projection, evaluateTally) {
        var doneCounter = 0;
        var results = 0;          
        collectionList.forEach(function (collectionName) {
          checkCollectionForHits(collectionName, query, projection, function (res) {
            log(`got request to find_one in ${collectionName} with` +
                ` query ${JSON.stringify(query)} and projection ${JSON.stringify(projection)}`);          
            doneCounter += 1;
            results+=res;
            if (doneCounter === collectionList.length) {
              evaluateTally(results);
            }
          });
        });
      }
      function evaluateTally(hits) {
        console.log("hits: ", hits);
        response.json(hits>0);
      }
      checkEach(collectionList, checkCollectionForHits, query, projection, evaluateTally);
    });    


    app.listen(port, () => {
      log(`running at http://localhost:${port}`);
    });

  });

}

serve();
