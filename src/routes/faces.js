var fs = require('fs');
var Faces = require('../database/Faces');

var getImg64 = function(file, callback) {
  fs.readFile(file, function(err, data) {
     callback(new Buffer(data).toString('base64'));
  });
};

exports.all = function(req, res){
  Faces.getAll(function(faces) {
    res.send(faces);
  });
};


var getGuessMode = function(modeName) {
  return require('../js/guessModes/'+modeName);
};

exports.random = function(req, res){
  var random = function(n) {
    return Math.floor(Math.random()*n);
  };

  var modes = ['chooseName', 'inputName'];
  
  var guessMode = getGuessMode(modes[random(modes.length)]);
  
  Faces.getRandom(1, function(faces) {
    var face = faces[0];
    var randomPhoto = face.photos[random(face.photos.length)];
    getImg64('public/images/faces/'+randomPhoto, function(img64) {
      guessMode.questionData(face, function(mode, faceData, extraData){
        res.send({
          _id: face._id,
          photo: img64,
          mode: mode,
          face: faceData,
          extras: extraData
        });
      });
    });
  });
};

exports.check = function(req, res){
  Faces.get(req.body._id, function(face){
    var guessMode = getGuessMode(req.body.mode);
    guessMode.guess(face, req.body, function(response){
      res.send(response);
    });
  });
};