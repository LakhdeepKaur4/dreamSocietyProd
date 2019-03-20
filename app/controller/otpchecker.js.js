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

const Owner = db.owner;

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
 console.log("req====>",req.body.otp);
 console.log("req====>",req.body);
 console.log(req.query);
 console.log("ownerIdencrypted===>",req.query.ownerId);   
let ownerId = decrypt(key,req.query.ownerId);
console.log(ownerId);
let owner = await Owner.findOne({where:{ownerId:ownerId,isActive:false}});
if(owner===undefined || owner===null){
return console.log("owner does not exist or have already been activated");
}
let otpToCheck = parseInt(req.body.otp);
let ownerKey = owner.ownerId;
let findOtp = await Otp.findOne({where:{otpvalue:otpToCheck,ownerId:ownerKey}});
if(findOtp===null || findOtp===undefined){
     return console.log('either your otp has expired or it is invalid');
}
let updatedOwner = await owner.updateAttributes({isActive:true});
if(updatedOwner){
     console.log('owner Successfully activated');
     sendMail(updatedOwner);
}
}