var mongoose = require('mongoose')
mongoose.connect('mongodb://test1:abcd123@fdq1.ni8.ir:27017/test1')
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  console.log('connected')
})

var Schema = mongoose.Schema

var examSchema = new Schema({

  course_code: { type: String },
  course_name: { type: String },
  date: { type: Date },
  level: { type: String },
  semester: { type: String },
  participants: [{
  }],
  enabled: { type: Boolean, default: false },
  seat_visible: { type: Boolean, default: false }
})

var Exam = mongoose.model('Exam', examSchema)

module.exports = {
  Exam
}
