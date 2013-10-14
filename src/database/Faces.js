var Face = require('./entities/Face.js');
var ObjectID = require('mongodb').ObjectID

var faces = {};

faces.getRandom = function(callback){
  Face.count({}, function(err, count) {
      var shift = Math.floor(Math.random()*count);
      var promise = Face.find().skip(shift).limit(1).exec();
      promise.addBack(function (err, docs) {
        callback(docs[0]);
      });
  });
};

faces.get = function(id, callback){
  var query = Face.find({_id: new ObjectID(id)});
  query.findOne(function (err, doc) {
      callback(doc);
  });
};


faces.getAll = function(callback){
	var promise = Face.find().exec();
	promise.addBack(function (err, docs) {
		callback(docs);
	});
};


module.exports = faces;