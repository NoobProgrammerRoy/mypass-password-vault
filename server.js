const express = require('express')
const app = express()
const path = require('path')
const router = require('./routes')
const bodyParser = require('body-parser')
const User = require('./models/users')
const port = process.env.PORT || 3000

// views and ejs
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// static files and routing
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({extended: true}))
app.use('/', router)

// server listening
app.listen(port, () => {
    console.log('server is running...')
})