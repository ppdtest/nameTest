var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
//뷰엔진
const hbs = require('hbs');

//데이터베이스
const {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose.js');
//직원 모델
var {Empl} = require('./model/empl.js');

//파일업로드
var multer  = require('multer');

//카운터 초기세팅용 임시
//var {Counter} = require('./model/counter.js');

var app = express();

hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');

//public/css public/js public/images
app.use(express.static(__dirname + '/uploads'));
app.use(express.static(__dirname + '/public'));


//미들웨어 세팅
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


//파일업로드
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  // 서버에 저장할 파일 명
  filename: function (req, file, callback) {
    file.uploadedFile = {
      name: req.query.id+ '-' + Date.now(),
      ext: file.mimetype.split('/')[1]
    };
    callback(null, file.uploadedFile.name + '.' + file.uploadedFile.ext);
  }
});
var upload = multer({ storage : storage}).single('userPhoto');


//update 구현
//홈
app.get('/',(req,res) => {
  // var counter = new Counter({
  // _id: 'entityId',
  //  seq: 0 }
  // );
  // counter.save().then((doc)=>{
  //   console.log("성공");
  // }, (e) => {
  //   res.status(400).send(e);
  // });


    res.render('home.hbs');
});

//리스트
app.get('/empls',(req,res) => {
  Empl.find().then((empls)=>{ //모두 찾아서 객체로 던짐
    res.render('list.hbs',{empls});

  }, (e) => {
    res.status(400).send(e);
  });
});

//테스트 첫화면에서는 가장 처음 데이터만 가져온다.
app.get('/test',(req,res) => {

  Empl.findOne({}).sort({_id: 1}).limit(1).then((empl)=>{
    if(!empl){
        res.status(404).send({err:'null'});
    }
    res.render('test.hbs',empl);
  }).catch( (e) => {
   res.status(400).send({err:'400'}) } );
});

//다음 버튼을 누르면 가져옴
app.get('/test/:id',(req,res) => {
  var curId = req.params.id;
  var flow = req.query.flow;

  //valid is using isValid -> 404 send back empty send
  if(!ObjectID.isValid(curId)){
    res.status(404).send({err:'isValid'});
  }
  console.log(curId);

  if (flow == "next") {
    Empl.findOne({_id: {$gt: curId}}).sort({_id: 1}).limit(1).then((empl)=>{
      if(!empl){
          res.status(404).send({err:'데이터가 더이상 없습니다.'});

      }
      res.render('test.hbs',empl);
    }).catch( (e) => {
     res.status(400).send({err:'400'}) } );
  }

  if (flow == "previous") {
    Empl.findOne({_id: {$lt: curId}}).sort({_id: -1}).limit(1).then((empl)=>{
      if(!empl){
          res.status(404).send({err:'데이터가 더이상 없습니다.'});
      }
      res.render('test.hbs',empl);
    }).catch( (e) => {
     res.status(400).send({err:'400'}) } );
  }
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
      res.render('listdetail.hbs',empl);
    }).catch( (e) =>   res.status(400).send({err:'400'}) );
});


app.get('/enroll',(req,res) => {
  res.render('enroll');
});


//POST
//이름은 제공하고 파일이미지 받은거는 fs모듈로 내부적으로 저장    이름,직급,이미지
//http://stackoverflow.com/questions/22195065/how-to-send-a-json-object-using-html-form-data
//json 형식으로 데이터가 들어와야 하는데 안들어옴
app.post('/empls',(req,res) => {

  var empl = new Empl({
    name : req.body[0].value
    ,position : req.body[1].value
  });

  empl.save().then((doc)=>{
    res.status(200).send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.post('/delete', (req,res) => {
  var id = req.body.id;
  console.log(id);

  //valid is using isValid -> 404 send back empty send
  if(!ObjectID.isValid(id)){
    res.status(404).send({err:'isValid'});
  }

  Empl.findByIdAndRemove(id).then((empl)=>{
    if(!empl){
        res.status(404).send({err:'null'});
    }
    res.status(200).send(empl);
  }).catch( (e) =>   res.status(400).send({err:'400'}) );
});


//이미지 업로드

app.post('/api/photo',function(req,res){

    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        console.log(req.file.filename);
        Empl.findByIdAndUpdate({_id: req.query.id }, { $set : { fileId: req.file.filename } },
         function(error, doc)   {
            if(error)
                return res.end("Error db upload err.");;
            res.end("File is uploaded");
        });

    });
});

app.listen(3000, ()=> {
  console.log('Started on port 3000');
});

module.exports = {app};
