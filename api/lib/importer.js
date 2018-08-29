'use strict'
const csv = require('csvtojson')
const XLSX = require('xlsx')
const path = require('path')
const multer = require('multer')
var moment = require('moment-jalaali')
const im = require('../fields').exam

const upload = multer({ //multer settings
  dest: 'uploads/',
  fileFilter: function (req, file, callback) { //file filter
    if (['.xls', '.xlsx', '.csv'].indexOf(path.extname(file.originalname)) === -1) {
      return callback(new Error('Wrong extension type'));
    }
    callback(null, true);
  }
}).single('file') //multer is used to add file in a directory

var myExam = {}

const field = {
  course_code: im.fields.course_code.title,
  course_name: im.fields.course_name.title,

  date: im.fields.date.title,
  level: im.fields.level.title,
  semester: im.fields.semester.title,
  participant: {
    std_name: im.fields.std_name.title,
    std_family_name: im.fields.std_family_name.title,
    std_number: im.fields.std_number.title,
    seat: im.fields.seat.title,
    location: im.fields.location.title,
    prof_name: im.fields.prof_name.title,
    prof_family_name: im.fields.prof_family_name.title,
    course_group: im.fields.course_group.title,

  }
}; // filed is used to access the the name of the fields in excel file

async function imported(jsonArray) {
  var exam = {};
  var participants = [];

  //loops are for reading row element with correct feild name
  for (var i = 0; i < jsonArray.length; i++) {

    participants.push({
      std_name: content(i, jsonArray, field).dynamics[0],
      std_family_name: content(i, jsonArray, field).dynamics[1],
      std_number: content(i, jsonArray, field).dynamics[2],
      seat: content(i, jsonArray, field).dynamics[3],
      location: content(i, jsonArray, field).dynamics[4],
      prof_name: content(i, jsonArray, field).dynamics[5],
      prof_family_name: content(i, jsonArray, field).dynamics[6],
      course_group: content(i, jsonArray, field).dynamics[7]
    });
  }
  exam = {
    course_code: content(2, jsonArray, field).statics[0],
    course_name: content(2, jsonArray, field).statics[1],
    date: content(2, jsonArray, field).dateform,
    level: content(2, jsonArray, field).statics[2],
    semester: content(2, jsonArray, field).statics[3]
  };

  return {
    exam,
    participants
  };
}


async function getfile(file) {
  return new Promise(async (resolve, reject) => {
    let ws
    let json

    switch (path.extname(file.originalname)) {
      case '.csv':
        const jsonArray = await csv().fromFile(file.path)
        myExam = await imported(jsonArray)
        resolve(myExam)
        return

      case '.xls':
        ws = XLSX.readFile(file.path)
        json = XLSX.utils.sheet_to_json(ws.Sheets[ws.SheetNames[0]])
        myExam = await imported(json)
        resolve(myExam)
        break
      case '.xlsx':
        ws = XLSX.readFile(file.path)
        json = XLSX.utils.sheet_to_json(ws.Sheets[ws.SheetNames[0]])
        myExam = await imported(json)
        resolve(myExam)
        break
      default:
        resolve(0)
    }
  })
}

module.exports = {
  getfile,
  upload
}

function content(i, jsonArray, field) {
  var dateform = ''
  var dynamics = []
  var statics = []
  var x = 0
  var y = 0

  for (var key in field)
    if (key === "participant")
      for (var key2 in field[key]) {
        for (let index = 0; index < field[key][key2].length; index++) {
          if (jsonArray[i][field[key][key2][index]] != undefined) {
            dynamics[y++] = jsonArray[i][field[key][key2][index]];
          }
        }
      }
  else if (key === "date") {
    for (let index = 0; index < field.date.length; index++) {
      if (jsonArray[i][field.date[index]] != undefined) {
        dateform = moment(jsonArray[i][field.date[index]], 'jYYYY/jM/jD').format('YYYY-M-D')
        //console.log(dateform)
      }
    }
  } else {
    for (let index = 0; index < field[key].length; index++) {
      if (jsonArray[i][field[key][index]] != undefined) {
        statics[x++] = jsonArray[i][field[key][index]];
      }
    }
  }

  return {
    dateform,
    dynamics,
    statics
  }
}
