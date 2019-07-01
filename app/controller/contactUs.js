const httpStatus = require('http-status');

const config = require('../config/config.js');
const mailjet = require('node-mailjet').connect(config.mail_public_key, config.mail_secret_key);

let sendMail = (name, email, message) => {
    const request = mailjet.post("send", { 'version': 'v3.1' })
        .request({
            "Messages": [
                {
                    "From": {
                        "Email": "rohit.khandelwal@greatwits.com",
                        "Name": "Greatwits"
                    },
                    "To": [
                        {
                            "Email": "jitendra.kukreja@greatwits.com",
                            "Name": 'Jitendra Kukreja'
                        }
                    ],
                    "Subject": "Dreamsociety - Contact Us Response",
                    "HTMLPart": `<h3>Name: ${name}</h3><br/><h3>Email: ${email}</h3><br/><h3>Message: ${message}</h3>`
                }
            ]
        })

    request.then(res => {
        console.log(res.body);
    })
        .catch(err => {
            console.log(err.statusCode)
        })
}

exports.email = (req, res, next) => {
    const mailer = req.body;
    console.log('Mailer ===>', mailer);

    sendMail(mailer.name, mailer.email, mailer.message);

    res.status(httpStatus.OK).json({
        message: 'Message submitted successfully'
    })
}