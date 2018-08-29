'use strict'
const csv = require('csvtojson')
const XLSX = require('xlsx')
const path = require('path')
const moment = require('moment-jalaali')
const im = require('../fields').exam
const Boom = require('boom') 

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
  let exam = {};
  let participants = [];

  //loops are for reading row element with correct feild name
  for (let i = 0; i < jsonArray.length; i++) {

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
  if (file === null){
      throw Boom.badRequest('فایلی اپلود نشده است')
  }
  
  let ws
  let json

  switch (path.extname(file.name)) {
    case '.csv':
      const jsonArray = await csv().fromStream(file.data)
      myExam = await imported(jsonArray)
      return [myExam]

    case '.xls':
    case '.xlsx':
      ws = XLSX.read(file.data)
      let result = []
      for(let sheet of ws.SheetNames){
        json = XLSX.utils.sheet_to_json(ws.Sheets[sheet])
        myExam = await imported(json)
        result.push(myExam)
      }
      return result

    default:
    throw Boom.badRequest('نوع فایل قابل قبول نیست')
  }
}

module.exports = {
  getfile,
 // upload
}

function content(i, jsonArray, field) {
  let dateform = ''
  let dynamics = []
  let statics = []
  let x = 0
  let y = 0

  for (let key in field)
    if (key === "participant")
      for (let key2 in field[key]) {
        let check = 0
        for (let index = 0; index < field[key][key2].length; index++) {
          if (jsonArray[i][field[key][key2][index]] != undefined) {
            dynamics[y++] = jsonArray[i][field[key][key2][index]];
            check = 1
          }
        }
        if(check == 0)
          dynamics[y++] = ''
      }
  else if (key === "date") {
    for (let index = 0; index < field.date.length; index++) {
      if (jsonArray[i][field.date[index]] != undefined) {
        dateform = moment(jsonArray[i][field.date[index]], 'jYYYY/jM/jD').format('YYYY-M-D')
        //console.log(dateform)
      }
    }
  } else {
    let check = 0
    for (let index = 0; index < field[key].length; index++) {
      if (jsonArray[i][field[key][index]] != undefined) {
        statics[x++] = jsonArray[i][field[key][index]];
        check = 1
      }
    }
    if(check == 0)
      statics[x++] = ''
  }

  return {
    dateform,
    dynamics,
    statics
  }
}
