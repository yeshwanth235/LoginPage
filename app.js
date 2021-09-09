if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const session = require("express-session")
const mongoose = require("mongoose")
const passport = require("passport")
const LocalStrategy = require('passport-local')
const User = require("./models/user")
const flash = require('connect-flash')
const app = express();
const catchAsync = require('./utils/catchAsync')
const dbUrl = process.env.db_connect;

app.use(express.urlencoded({ extended: true }));

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("Mongo Connection Open")
    })
    .catch(err => {
        console.log("Ho No Mongo Connection Error: ")
        console.log(err)
    })

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
//initializing express-session
app.use(session({
    //It holds the secret key for session
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false
}))
// initializing the passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//initializing the flash
app.use(flash());

app.get('/' || 'login', (req, res) =>{
    res.render('login')
})

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.post('/signup', catchAsync(async(req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const newUser = await User.register(user, password)
        await newUser.save();
        req.flash('succcess', 'welcome you have been registered')
        res.redirect('/')
    } catch(e) {
        req.flash('error', e.message)
        res.redirect('/signup')
    }
}))

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'welcome Back!');
    res.render('home')
})

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login')
})

const port = process.env.PORT || 3000
app.listen(port, ()=>{
    console.log("listening on port 3000")
})