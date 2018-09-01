const express = require('express')
const cors = require('cors')
const app = module.exports = express()
const bodyparser = require('body-parser')
const fileUpload = require('express-fileupload')
const {getfile} = require('./lib/importer')
const {Exam} = require('./exam')

app.use(cors())
app.use(fileUpload())

app.listen(3001, function () {
  console.log('listening on 3001')
})

app.use(bodyparser.json())

app.post('/import', async function (req, res) {
  res.sendStatus(200)
  // use express-fileupload package
  const exams = await getfile(req.files.file)

  for (let exam of exams) {
    let newExam = await new Exam({
      course_code: exam.exam.course_code,
      course_name: exam.exam.course_name,
      date: exam.exam.date,
      level: exam.exam.level,
      semester: exam.exam.semester,
      participants: exam.participants
    })
    newExam.save(function (error) {
      if (error) { console.log(error) }
    })
  }
})
