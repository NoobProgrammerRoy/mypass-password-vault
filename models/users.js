const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/mypass', { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

db.on('error', err => {
    console.error(err)
})

db.once('open', () => {
    console.log('Database Connection Established!')
})

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    savedPasswords: [{
        application: { type: String, required: true },
        applicationPassword: { type: String, required: true }
    }]
})

userSchema.methods.add = () => {
    console.log('User created successfully!')
}

const user = mongoose.model('User', userSchema)
module.exports = user