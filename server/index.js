const express = require('express')
const app = express()
const port = 5000
const bodyParser=require('body-parser') 
const cookieParser=require('cookie-parser')
const {User}=require("./models/User")
const config=require('./config/key')
const {auth}=require('./middleware/auth')

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}))

// application/json
app.use(bodyParser.json())
app.use(cookieParser())

const mongoose=require('mongoose')

mongoose.connect(config.mongoURI,{
    useNewUrlParser:true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(()=>console.log('MongoDB Connected...'))
  .catch(err=>console.log(err))

app.get('/', (req, res) => {
  res.send('Hello, World!')
})

app.get('/api/hello',(req,res)=>{
  res.send("Hello, World! 안녕하세요!")
})

app.post('/api/users/register',(req,res)=>{
  // 회원가입 시 필요한 정보들을 클라이언트에서 가져오면
  // 이들을 데이터베이스에 저장한다

  const user=new User(req.body)

  user.save((err,userInfo)=>{
    if(err) return res.json({success:false,err})
    return res.status(200).json({
      success: true
    })
  })

})

app.post('/api/users/login',(req,res)=>{

  // 요청된 이메일이 데이터베이스에 있는지 찾는다
  User.findOne({email:req.body.email},(err,user)=>{
    if(!user){
      return res.json({
        loginSuccess: false,
        message:"입력하신 이메일에 해당하는 유저가 없습니다."
      })
    }

    // 만약 있다면 비밀번호가 일치하는지 확인한다
    user.comparePassword(req.body.password,(err,isMatch)=>{
      if(!isMatch){
        return res.json({
          loginSuccess: false,
          message:"비밀번호가 일치하지 않습니다."
        })
      }

      // 일치한다면 토큰을 생성한다
      user.generateToken((err,user)=>{
        if(err) return res.status(400).send(err);

        // 쿠키에 토큰을 저장한다
        res.cookie("x_auth",user.token)
        .status(200)
        .json({loginSuccess:true,userId:user._id})
      })
    })
  })
})

app.get('/api/users/auth',auth,(req,res)=>{
  // 미들웨어를 통과해 여기까지 왔으면 인증은 성공했다는 것
  res.status(200).json({
    _id:req.user._id,
    isAdmin: req.user.role===0?false:true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

app.post('/api/users/logout',auth,(req,res)=>{
  User.findOneAndUpdate(
    {_id:req.user._id},
    {token:""},
    (err,user)=>{
      if(err) return res.json({success: false,err})
      return res.status(200).send({
        success:true
      })
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})