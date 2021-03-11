function generatePassword(length) {
    let password = ""
    let characters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0123456789"
    let charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        password += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return password
}

module.exports = generatePassword