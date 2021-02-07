const mongoose=require('mongoose')

const userSchema=mongoose.Schema({
    name:{
        type:String,
        maxlength: 50
    },
    email:{
        type:String,
        trim:true, // 문자열 사이의 공백을 없앰
        unique: 1  // 중복되는 이메일 사용 금지
    },
    password:{
        type:String,
        minlength:5
    },
    lastname:{
        type:String,
        maxlength:50
    },
    role:{
        type: Number,
        default: 0
    },
    image: String,
    token:{
        type: String
    },
    tokenExp:{
        type: Number
    }
})

const User=mongoose.model('User',userSchema)

module.exports={User}