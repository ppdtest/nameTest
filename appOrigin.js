var express = require('express');
var bodyParser = require('body-parser');

//뷰엔진
const hbs = require('hbs');

//데이터베이스
const {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose.js');
//직원 모델
var {Empl} = require('./models/empl.js');

var app = express();

hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');

//public/css public/js public/images
app.use(express.static(__dirname + '/public'));


//미들웨어 세팅
app.use(bodyParser.json());


//update 구현


//postman json 테스트

app.get('/empls',(req,res) => {
  Empl.find().then((empls)=>{ //모두 찾아서 객체로 던짐
    res.send({empls});
  }, (e) => {
    res.status(400).send(e);
  });
});

//GET /todos/12345 url variable
app.get('/empls/:id', (req,res) => {
  var id = req.params.id;
  //valid is using isValid -> 404 send back empty send
  if(!ObjectID.isValid(id)){
    res.status(404).send({err:'isValid'});
  }
  //findById
    //success case
      //if todo - send it back
      //if no todos - send back 404 with empty body
    //error
      //400 - and send empty body back
    Empl.findById(id).then((empl)=>{
      if(!empl){
          res.status(404).send({err:'null'});
      }
      res.send({empl});
    }).catch( (e) =>   res.status(400).send({err:'400'}) );
});


//POST
//이름은 제공하고 파일이미지 받은거는 fs모듈로 내부적으로 저장    이름,직급,이미지
app.post('/empls',(req,res) => {
  var empl = new Empl({
    name : req.body.name,
    position : req.body.position
  });

  empl.save().then((doc)=>{
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});



app.listen(3000, ()=> {
  console.log('Started on port 3000');
});

module.exports = {app};
