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


let testSms = (contact) => {
    const apikey = 'mJUH4QVvP+E-coDtRnQr7wvdVc8ClAWDcKjPew8Gxl';
    const number = contact;
    const OTP = Math.floor(100000 + Math.random() * 900000);
    const message = 'OTP-' +  OTP;
  
    http.get(`http://api.textlocal.in/send/?apiKey=${apikey}&numbers=${number}&message=${message}`,function(err,data){
        console.log('messageSend');
        
    });
    return OTP;

  };


exports.checkToken = async (req,res,next) => {
    //  console.log("req====>",req.body.otp);
    //  console.log("req====>",req.body);
    //  console.log(req.query);
    jwt.verify(req.query.token, 'secret', async (err, decoded) => {
        if (err){
            console.log(err);
            return res.status(200).json(
                    {
                    tokenVerified: false,    
                    message: 'your token has expired'
                });
        }
        else{
            if(req.query.ownerId){
                let ownerId = decrypt(key,req.query.ownerId);
               let owner = await Owner.findOne({where:{ownerId:ownerId}});
               let contact = decrypt(key,owner.contact);
               let otp = testSms(contact);
               let dbotp = await Otp.create({
                otpvalue:otp,
                ownerId:owner.ownerId
                }) 
              
            }
            if(req.query.tenantId){
                let tenantId = decrypt1(key,req.query.tenantId);
               let tenant = await Tenant.findOne({where:{tenantId:tenantId}});
               let contact = decrypt1(key,tenant.contact);
               let otp = testSms(contact);
               let dbotp = await Otp.create({
                otpvalue:otp,
                tenantId:tenant.tenantId
                }) 
              
            }
            return res.status(200).json(
                {
                tokenVerified: true,
                message: 'your OTP has been delievered'
            });
        }
    
    }
    )
}