let mailToUser = (email, tenantId) => {
    const token = jwt.sign(
        { data: 'foo' },
        'secret', { expiresIn: '1h' });
    tenantId = encrypt(tenantId.toString());
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
                            "Email": email,
                            "Name": 'Atin' + ' ' + 'Tanwar'
                        }
                    ],
                    "Subject": "Activation link",
                    "HTMLPart": `<b>Click on the given link to activate your account</b> <a href="http://mydreamsociety.com/login/tokenVerification?tenantId=${tenantId}&token=${token}">click here</a>`
                }
            ]
        })
    request
        .then((result) => {
            console.log(result.body)
            // console.log(`http://192.168.1.105:3000/submitotp?userId=${encryptedId}token=${encryptedToken}`);
        })
        .catch((err) => {
            console.log(err.statusCode)
        })
}


// exports.checkAndSendMail = (req,res,next) => {
//     jwt.verify(req.query.token, 'secret', async (err, decoded) => {
//         if (err) {
//             console.log(err);
//             return res.status(200).json(
//                 {
//                     tokenVerified: false,
//                     message: 'your token has expired'
//                 });
//         }
//         else {

//         }
    