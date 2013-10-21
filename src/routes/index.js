
/*
 * GET home page.
 */

var fs = require('fs');
var Faces = require('../database/Faces.js');
var stringUtils = require('../js/utils/StringUtils.js');
var settings = require('../../settings.js');


var getImg64 = function(file, callback) {
  fs.readFile(file, function(err, data) {
   callback(new Buffer(data).toString('base64'));
});
}

var random = function(n) {
  return Math.floor(Math.random()*n);
}

exports.template = function(req, res){
	var path = req.params;
  	res.render(path);
};

exports.index = function(req, res){
  	res.render('main', { appName: settings.appName});
};

exports.random = function(req, res){
	Faces.getRandom(function(face) {
		var randomPhoto = face.photos[random(face.photos.length)];
    getImg64('public/images/faces/'+randomPhoto, function(img64) {
      res.send({
        _id: face._id,
        photo: img64
      });
    });
	});
};

exports.all = function(req, res){
  Faces.getAll(function(faces) {
    res.send(faces);
  });
};

exports.check = function(req, res){

    var match = function(face, text) {
      text = text.replace(/\s+/g, ' ').toLowerCase();
      text = stringUtils.latinize(text);
      console.log(text);
      var scoreA = (face.forename + ' ' + face.surname).toLowerCase().score(text);
      var scoreB = (face.surname + ' ' + face.forename).toLowerCase().score(text);
      return Math.max(scoreA, scoreB);
    };

    var createCorrectResponse = function(face) {
      return {
        status: 'correct',
        message: 'Yes, this is ' + face.forename + ' ' + face.surname
      };
    };

    var createPartialResponse = function(face) {
      return {
        status: 'partial',
        message: 'Almost correct, it is ' + face.forename + ' ' + face.surname
      };
    };

    var createWrongResponse = function(face, guess, trial) {

      var hintVersion = random(2) === 0 ? 'forename' : 'surname';
      var responses = {
        1: {
          status: 'wrong',
          message: 'No, ' + hintVersion + ' starts with "'+face[hintVersion][0]+'"'
        },
        2: {
          status: 'wrong',
          message: 'Wrong, ' + hintVersion + ' is "'+face[hintVersion]+'"'
        },
        3: {
          status: 'wrong',
          message: 'No, it is ' + face.forename + ' ' + face.surname
        }
      };

      return responses[trial];
    };

    Faces.get(req.body._id, function(face) {
        var score = match(face, req.body.guess || '');
        var response;
        if(score == 1.0) {
          response = createCorrectResponse(face);
        } else if(score > 0.7) {
          response = createPartialResponse(face);
        } else {
          response = createWrongResponse(face, req.body.guess, req.body.trial);
        }
        res.send(response);
    });
};
