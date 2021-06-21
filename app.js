const express = require('express')
const app = express()
const path = require('path')
const public_path = path.join(__dirname,'/public')
const hbs = require('express-handlebars')
const mongoose = require('mongoose')
const session = require('express-session')
const methodOverride = require('method-override')
const passport = require('passport')
const flash = require('connect-flash')
const upload = require('express-fileupload')
const {PORT} = require('./config/config')
const DBurl = process.env.DB_URL
const session_secret = process.env.secret

mongoose.connect(DBurl,{useNewUrlParser: true, useFindAndModify:false, useUnifiedTopology: true}).then(()=>{
console.log('Database Connected')})


app.use(express.static(public_path))
app.engine('handlebars',hbs({defaultLayout: 'index'}))
app.set('view engine', 'handlebars')
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(session({
    secret: session_secret,
    resave: false,
    saveUninitialized: true}));
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'))
app.use(upload())
app.use((req,res,next)=>{
  res.locals.success_message  = req.flash('success_message')
  res.locals.error_message = req.flash('error_message')
  res.locals.error = req.flash('error')
  next()})
  
const indexRouter = require('./routes/indexRouter')
app.use('/' ,indexRouter)

app.use(function (err, req, res, next) {
  console.log(err.stack)
  res.status(500).render('500')})

app.listen(PORT,()=>{
    console.log("Server running on " + PORT)
})

