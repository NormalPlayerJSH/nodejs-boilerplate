const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const saltRounds=10 // salt의 길이
const jwt=require('jsonwebtoken')

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

userSchema.pre('save',function(next){
    var user=this
    if(user.isModified('password')){
        // 비밀번호를 암호화한다
        bcrypt.genSalt(saltRounds,function(err,salt){
            if(err) return next(err)
            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err)
                user.password=hash
                next()
            })
        })
    } else{
        next()
    }
})

userSchema.methods.comparePassword=function(plainPassword,cb){
    // plainPassword와 데이터베이스의 암호화된 비밀번호가 일치하는지 확인
    bcrypt.compare(plainPassword,this.password,function(err,isMatch){
        if(err) return cb(err)
        cb(null,isMatch)
    })
}

userSchema.methods.generateToken=function(cb){

    var user=this;

    //jsonwebtoken을 이용해 토큰을 생성한다
    var token=jwt.sign(user._id.toHexString(),'secretToken')
    user.token=token
    user.save(function(err,user){
        if(err) return cb(err)
        cb(null,user)
    })
    
}

userSchema.statics.findByToken=function(token,cb){
    var user=this

    // 토큰을 decode한다
    jwt.verify(token,'secretToken',function(err,decoded){
        // 유저 아이디를 이용해 유저를 찾은 후
        // 클라이언트에서 가져온 토큰과 
        // 데이터베이스에 있는 토큰이 일치하는지 확인
        user.findOne({"_id":decoded,"token":token},function(err,user){
            if(err) return cb(err)
            cb(null,user)
        })
    })
}

const User=mongoose.model('User',userSchema)

module.exports={User}