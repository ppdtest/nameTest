var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CounterSchema = Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});
var counter = mongoose.model('counter', CounterSchema);

var emplSchema = mongoose.Schema({
  name: { //이름
    type: String,
    required:true,
    minlength: 1,
    trim: true
  },
  seqNum:{  //파일경로
    type: Number,
    //default : "defaultfile 경로 설정"
  },
  fileId:{  //파일경로
    type: String,
    //default : "defaultfile 경로 설정"
  },
  position:{  //직위
    type : String,
    default : null
  }
});

emplSchema.pre('save', function(next) {
    var doc = this;
    counter.findByIdAndUpdate({_id: 'entityId'}, {$inc: { seq: 1} }, function(error, counter)   {
        if(error)
            return next(error);
        doc.seqNum = counter.seq;
        next();
    });
});


var Empl = mongoose.model('Empl', emplSchema);

module.exports = {Empl};
