
const db = require('./config/db.config.js');
const config = require('./config/config.js');
const httpStatus = require('http-status');
var crypto = require('crypto');
var bcrypt = require('bcryptjs');
const { password } = require('./config/env.js');

decrypt = (text) => {
    let key = config.secret;
    let algorithm = 'aes-128-cbc';
    let decipher = crypto.createDecipher(algorithm, key);
    let decryptedText = decipher.update(text, 'hex', 'utf8');
    decryptedText += decipher.final('utf8');
    return decryptedText;
}


constraintCheck = (property, object) => {
	if ((property in object) && object[property] !== undefined && object[property] !== '' && object[property] !== null) {
		return true;
	} else {
		return false;
	}
}

function testEn() {
    
    var decryptedText = decrypt("82ebc95f3eda6664cf481470927a758d94da5e71ae7ca6b06bbf7794027a8fae");
    console.log("--------------------"); 
    console.log(decryptedText);

    console.log("--------------------");
    // password = passwordConstraintReturn(passwordCheck, abc, 'password', user);
    // console.log(`password`,password);
 }
 
function generatePassword(password) {
generatedPassword = bcrypt.hashSync(password, 8)
console.log(generatedPassword)
}

// generatePassword("Test1234##")

  testEn()