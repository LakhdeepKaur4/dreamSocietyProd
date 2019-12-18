const mailjet = require('../config/config');
const fs = require('fs');
const path = require('path');
var template = fs.readFileSync(path.resolve(__dirname, '../../views/email.hbs'), 'utf8');
const handlebars = require('handlebars');
const compiledTemplate = handlebars.compile(template);

const mailJet = require('node-mailjet').connect(
    mailjet.mailjet_key,
    mailjet.mailjet_secret
)

mailToUser = (email, name, occasion) => {
    console.log("___", email, name, occasion);
    const request = mailJet.post("send", {
        'version': 'v3.1'
    })
        .request({
            "Messages": [{
                "From": {
                    "Email": mailjet.mailjet_email,
                    "Name": "Greatwits"
                },
                "To": [{
                    "Email": email,
                    "Name": name
                }],
                "Subject": `${occasion} invitation`,
                "HTMLPart": compiledTemplate({ name: name, occasion: occasion })
                // "HTMLPart": `<p>Thanks ${name} for trusting courier express.<p>Your username is : ${userName}</p><p></p><p>Your password is : ${password}</p><br />Have a nice day<p>`,
            }]
        })
    request
        .then((result) => {
            return result.body;
        })
        .catch((err) => {
            return err.statusCode;
        })
}

emailHtml = async (req, res, next) => {
    try {
        mailToUser("lakhdeep.kaur@greatwits.com", "alex", "Christmas");
        res.render('email', { name: 'Alex', occasion: 'Christmas' });
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    mailToUser,
    emailHtml
}