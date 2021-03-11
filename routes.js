const express = require('express')
const session = require('express-session')
const flash = require('express-flash')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
const router = express.Router()
const User = require('./models/users')
const generatePassword = require('./password')

// Session Information
router.use(cookieParser('secret'))
router.use(session({
    cookie: {maxAge: 60000},
    secret: '1234567890',
    resave: false,
    saveUninitialized: false
}))

// Flash messages
router.use(flash())

// Index Page
router.get('/', (req, res) => {
    if(req.session.user) {
        return res.redirect('/home')
    }
    res.render('index')
})

router.post('/', async (req, res) => {
    const myEmail = req.body.email
    const myPassword = req.body.password
    if (myEmail.trim().length == 0 || myPassword.trim().length == 0) {
        req.flash('info', 'Email or Password cannot be empty!')
        return res.render('index')
    }
    const result = await User.find({ email: myEmail})
    if (result.length != 0 && await bcrypt.compare(myPassword, result[0].password)) {
        req.session.user = result[0]
        res.redirect('/home')
    }
    else {
        req.flash('info', 'Invalid Email or Password!')
        res.render('index')
    }    
})

// Sign up Page
router.get('/signup', (req, res) => {
    if(req.session.user){
        return res.redirect('/home')
    }
    res.render('signup')
})

router.post('/signup', async (req, res) => {
    const myUsername = req.body.username
    const myEmail = req.body.email
    const myPassword = req.body.password
    if(myUsername.trim().length == 0 || myEmail.trim().length == 0 || myPassword.trim().length == 0) {
        req.flash('info', 'Username, Email ID or Password cannot be empty!')
        return res.redirect('/signup')
    }
    else if(myUsername.trim().length > 16 || myEmail.trim().length > 32 || myPassword.trim().length > 16) {
        req.flash('info', 'Username, Email ID or Password is too long!')
        return res.redirect('/signup')
    }
    const result = await User.find({ email: myEmail })
    if(result.length == 0){
        const hashedPassword = await bcrypt.hash(myPassword, 10)
        const newUser = new User({
            username: myUsername,
            email: myEmail,
            password: hashedPassword
        })
        newUser.save((err, newUser) => {
            if (err) return console.error(err)
        })
        req.flash('success', 'Account successfully created!')
        res.redirect('../home')
    }
    else{
        req.flash('info', 'Email ID already exists!')
        res.render('signup')
    }
})

// Home / Passwords Page
router.get('/home', (req, res) => {
    if (!req.session.user) {
        return res.redirect('../')
    }
    const user = req.session.user
    const password = '******'
    res.render('home', { user: user, password: password })
})

router.post('/home', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('../')
    }
    const application = req.body.application
    const length = req.body.length
    if(application.trim().length == 0 || application.trim().length > 32){
        req.flash('info', 'Application name must be between 1 to 32 characters!')
        return res.redirect('/home')
    }
    if(length < 6 || length > 30){
        req.flash('info', 'Password length must be between 1 to 30 characters!')
        return res.redirect('/home')
    }
    const password = generatePassword(length)
    const user = req.session.user
    await User.updateOne({ email: user.email }, { $push: { savedPasswords: { application: application, applicationPassword: password } } })
    const result = await User.find({ email: user.email, password: user.password })
    if (result.length != 0) {
        req.session.user = result[0]
    }
    // res.render('home', { user: user })
    res.redirect('../home')
})

// Delete Password
router.get('/delete/:id', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('../')
    }
    const user = req.session.user
    await User.updateOne({ email: user.email }, { $pull: { savedPasswords: { _id: req.params.id } } })
    const result = await User.find({ email: user.email, password: user.password })
    if (result.length != 0) {
        req.session.user = result[0]
    }
    res.redirect('../home')
})

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return console.error(err)
        res.redirect('../')
    })
})

module.exports = router