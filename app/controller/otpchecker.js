// const db = require("../config/db.config.js");
// const config = require("../config/config.js");
// const httpStatus = require("http-status");
// var passwordGenerator = require("generate-password");
// const key = config.secret;
// const fs = require("fs");
// const http = require('http');
// const crypto = require("crypto");
// const Op = db.Sequelize.Op;
// const path = require("path");
// const shortId = require("short-id");
// const nodeMailer = require('nodemailer');
// const smtpTransport = require('nodemailer-smtp-transport');
// const jwt = require('jsonwebtoken');
// const mailjet = require('node-mailjet').connect('5549b15ca6faa8d83f6a5748002921aa', '68afe5aeee2b5f9bbabf2489f2e8ade2');


// const Owner = db.owner;

// const OwnerMembersDetail = db.ownerMembersDetail;
// const FlatDetail = db.flatDetail;
// const Tower = db.tower;
// const Society = db.society;
// const User = db.user;
// const Relation = db.relation;
// const Otp = db.otp;

// function decrypt(key, data) {
//     console.log(data);
//     var decipher = crypto.createDecipher("aes-256-cbc", key);
//     var decrypted = decipher.update(data, "hex", "utf-8");
//     decrypted += decipher.final("utf-8");

//     return decrypted;
// }



// let mailToUser = (owner) => {
//     let email = decrypt(key, owner.email);
//     let password = owner.password;
//     let userName = decrypt(key, owner.userName);
//     const request = mailjet.post("send", { 'version': 'v3.1' })
//         .request({
//             "Messages": [
//                 {
//                     "From": {
//                         "Email": "rohit.khandelwal@greatwits.com",
//                         "Name": "Greatwits"
//                     },
//                     "To": [
//                         {
//                             "Email": email,
//                             "Name": 'Atin' + ' ' + 'Tanwar'
//                         }
//                     ],
//                     "Subject": "Activation link username and password",
//                     "HTMLPart": `your username is: ${userName} and password is: ${password}. `
//                 }
//             ]
//         })
//     request
//         .then((result) => {
//             console.log(result.body)
//             // console.log(`http://192.168.1.105:3000/submitotp?userId=${encryptedId}token=${encryptedToken}`);
//         })
//         .catch((err) => {
//             console.log(err.statusCode)
//         })
// }


// function sendMail(owner) {
//     let email = decrypt(key, owner.email);
//     let password = owner.password;
//     let userName = decrypt(key, owner.userName);
//     let transporter = nodeMailer.createTransport(smtpTransport({
//         service: 'gmail',
//         auth: {
//             user: 'avitanwar1234@gmail.com',
//             pass: '8459143023'
//         },

//     }));


//     let mailOptions = {
//         from: ' "avi" <avitanwar1234@gmail.com>', // sender address
//         to: email, // list of receivers
//         subject: 'test', // Subject line
//         text: 'this is to test api. click on the link below to verify', // plain text body
//         html: `your username is: ${userName} and password is: ${password}. ` // html body
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             return console.log(error);
//         }
//         console.log('Message %s sent: %s', info.messageId, info.response);
//         console.log('mail send');
//     });
// };



// exports.checkOtp = async (req, res, next) => {
//     // console.log("req====>", req.body.otp);
//     // console.log("req====>", req.body);
//     console.log(req.query);
//     let decoded = jwt.verify(req.query.token,'secret');
//     console.log(decoded);
//     // console.log("ownerIdencrypted===>", req.query.ownerId);
//     let ownerId = decrypt(key, req.query.ownerId);
//     // console.log(ownerId);
//     let owner = await Owner.findOne({ where: { ownerId: ownerId, isActive: false } });
//     if (owner === undefined || owner === null) {
//         return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "owner does not exist or have already been activated" });
//     }
//     let otpToCheck = parseInt(req.body.otp);
//     let ownerKey = owner.ownerId;
//     let findOtp = await Otp.findOne({ where: { otpvalue: otpToCheck, ownerId: ownerKey } });
//     if (findOtp === null || findOtp === undefined) {
//         return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: 'either your otp has expired or it is invalid' });
//     }
//     let updatedOwner = await owner.updateAttributes({ isActive: true });
//     if (updatedOwner) {
//         mailToUser(updatedOwner);
//         return res.status(httpStatus.OK).json({ message: 'owner Successfully activated' });
//     }
// }



















const db = require("../config/db.config.js");
const config = require("../config/config.js");
const httpStatus = require("http-status");
var passwordGenerator = require("generate-password");
const key = config.secret;
const fs = require("fs");
const http = require('http');
const crypto = require("crypto");
const Op = db.Sequelize.Op;
const path = require("path");
const shortId = require("short-id");
const nodeMailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const jwt = require('jsonwebtoken');
const mailjet = require('node-mailjet').connect('5549b15ca6faa8d83f6a5748002921aa', '68afe5aeee2b5f9bbabf2489f2e8ade2');


const Owner = db.owner;
const Tenant = db.tenant;

const OwnerMembersDetail = db.ownerMembersDetail;
const FlatDetail = db.flatDetail;
const Tower = db.tower;
const Society = db.society;
const User = db.user;
const Relation = db.relation;
const Otp = db.otp;

function decrypt(key, data) {
    console.log(data);
    var decipher = crypto.createDecipher("aes-256-cbc", key);
    var decrypted = decipher.update(data, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
  
    return decrypted;
  }

  function decrypt1(key, data) {
    var decipher = crypto.createDecipher("aes-128-cbc", key);
    var decrypted = decipher.update(data, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
  
    return decrypted;
  }


  let mailToUser = (owner) => {
    let email = decrypt(key,owner.email);
    let password = owner.password;
    let userName = decrypt(key,owner.userName);
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
                      "Subject": "Activation link username and password",
                      "HTMLPart": `your username is: ${userName} and password is: ${password}. `
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
  


  function sendMail(owner) {
    let email = decrypt(key,owner.email);
    let password = owner.password;
    let userName = decrypt(key,owner.userName);
    let transporter = nodeMailer.createTransport(smtpTransport({
      service: 'gmail',
      auth: {
          user: 'avitanwar1234@gmail.com',
          pass: '8459143023'
      },
      
  }));
  
     
      let mailOptions = {
          from: ' "avi" <avitanwar1234@gmail.com>', // sender address
          to: email, // list of receivers
          subject: 'test', // Subject line
          text: 'this is to test api. click on the link below to verify', // plain text body
          html: `your username is: ${userName} and password is: ${password}. ` // html body
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message %s sent: %s', info.messageId, info.response);
          console.log('mail send');
      });
  };
  


exports.checkOtp = async (req,res,next) => {

    console.log("my name is atin===>", req.query);
//  console.log("req====>",req.body.otp);
//  console.log("req====>",req.body);
//  console.log(req.query);
// jwt.verify(req.query.token, 'secret', async (err, decoded) => {
//     if (err){
//         console.log(err);
//         return res.status(500).json({ 
//                 auth: false, 
//                 message: 'Fail to Authentication. Error -> ' + err 
//             });
//     }
    // else{
        if(req.query.ownerId){
            let ownerId = decrypt(key,req.query.ownerId);
            console.log(ownerId);
            let owner = await Owner.findOne({where:{ownerId:ownerId,isActive:false}});
            if(!owner){
                return res.status(200).json(
                    {
                    otpVerified: false,    
                    message: 'owner does not exist or have already been activated'
                });
                // return console.log("owner does not exist or have already been activated");
            }
            let otpToCheck = parseInt(req.body.otp);
            let ownerKey = owner.ownerId;
            let findOtp = await Otp.findOne({where:{otpvalue:otpToCheck,ownerId:ownerKey}});
            if(findOtp===null || findOtp===undefined){
                //  return console.log(' your otp  is invalid');
                return res.status(200).json(
                    {
                    otpVerified: false,    
                    message: 'otp is invalid'
                });
                
            }
            let updatedOwner = await owner.updateAttributes({isActive:true});
            if(updatedOwner){
                //  console.log('owner Successfully activated');
                 mailToUser(updatedOwner);
                 return res.status(200).json(
                    {
                    otpVerified: true,    
                    message: 'owner Successfully Activated'
                });
            }
        }
        if(req.query.tenantId){
        let tenantId = decrypt1(key,req.query.tenantId);
        console.log(tenantId);
        let tenant = await Tenant.findOne({where:{tenantId:tenantId,isActive:false}});
        if(tenant===undefined || tenant===null){
        return console.log("tenant does not exist or have already been activated");
        }
        let otpToCheck = parseInt(req.body.otp);
        let tenantKey = tenant.tenantId;
        let findOtp = await Otp.findOne({where:{otpvalue:otpToCheck,tenantId:tenantKey}});
        if(findOtp===null || findOtp===undefined){
             return console.log('either your otp has expired or it is invalid');
        }
        let updatedTenant = await tenant.updateAttributes({isActive:true});
        if(updatedTenant){
             console.log('tenant Successfully activated');
             mailToUser(updatedTenant);
        }
        }
        
    }

    
// });
//  console.log("token ====> ",req.query.token)
    // let  decoded = jwt.verify(req.query.token, 'secret');
    // console.log("my token",decoded);
//  console.log("ownerIdencrypted===>",req.query.ownerId);   
// let ownerId = decrypt(key,req.query.ownerId);
// console.log(ownerId);
// let owner = await Owner.findOne({where:{ownerId:ownerId,isActive:false}});
// if(owner===undefined || owner===null){
// return console.log("owner does not exist or have already been activated");
// }
// let otpToCheck = parseInt(req.body.otp);
// let ownerKey = owner.ownerId;
// let findOtp = await Otp.findOne({where:{otpvalue:otpToCheck,ownerId:ownerKey}});
// if(findOtp===null || findOtp===undefined){
//      return console.log('either your otp has expired or it is invalid');
// }
// let updatedOwner = await owner.updateAttributes({isActive:true});
// if(updatedOwner){
//      console.log('owner Successfully activated');
//      mailToUser(updatedOwner);
// }
// }

// exports.checkOtp = async (req,res,next) => {
//     try {
//     var decoded = jwt.verify(req.query.token, 'secret');
//     if()
      
//      console.log("req====>",req.body.otp);
//      console.log("req====>",req.body);
//      console.log(req.query);
//     //  console.log("ownerIdencrypted===>",req.query.ownerId);
//     if(req.query.ownerId){
//         let ownerId = decrypt(key,req.query.ownerId);
//         console.log(ownerId);
//         let owner = await Owner.findOne({where:{ownerId:ownerId,isActive:false}});
//         if(owner===undefined || owner===null){
//         return console.log("owner does not exist or have already been activated");
//         }
//         let otpToCheck = parseInt(req.body.otp);
//         let ownerKey = owner.ownerId;
//         let findOtp = await Otp.findOne({where:{otpvalue:otpToCheck,ownerId:ownerKey}});
//         if(findOtp===null || findOtp===undefined){
//              return console.log('either your otp has expired or it is invalid');
//         }
//         let updatedOwner = await owner.updateAttributes({isActive:true});
//         if(updatedOwner){
//              console.log('owner Successfully activated');
//              mailToUser(updatedOwner);
//         }
//     }
//     if(req.query.tenantId){
//         let tenantId = decrypt1(key,req.query.tenantId);
//         console.log(tenantId);
//         let tenant = await Tenant.findOne({where:{tenantId:tenantId,isActive:false}});
//         if(tenant===undefined || tenant===null){
//         return console.log("tenant does not exist or have already been activated");
//         }
//         let otpToCheck = parseInt(req.body.otp);
//         let tenantKey = tenant.tenantId;
//         let findOtp = await Otp.findOne({where:{otpvalue:otpToCheck,tenantId:tenantKey}});
//         if(findOtp===null || findOtp===undefined){
//              return console.log('either your otp has expired or it is invalid');
//         }
//         let updatedTenant = await tenant.updateAttributes({isActive:true});
//         if(updatedTenant){
//              console.log('owner Successfully activated');
//              mailToUser(updatedTenant);
//         }
//     }
// } catch(err) {
//     console.log(err)
// }
// }  
    