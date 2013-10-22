var _ = require('underscore');
var Faces = require('../../database/Faces');
var stringUtils = require('../utils/StringUtils');

var getFullname = function(face) {
  return face.forename + " " + face.surname;
};

exports.questionData = function(originalFace, callback) {
  var face = _.omit(originalFace, 'forename', 'surname');
  // Find some additional random names in database
  Faces.getRandom(3, function(faces){
    var namesToChoose = [originalFace].concat(faces).map(getFullname);

    callback('chooseName', face, _.shuffle(namesToChoose));
  });
};

exports.guess = function(face, input, callback) {

    if (getFullname(face) === input.answer) {
      callback({
        status: 'correct',
        face: face,
        answer: input.answer
      });
    } else {
      callback({
        status: 'wrong',
        face: face,
        answer: input.answer
      });  
    }

};