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




// new Code


















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
const Employee = db.employee;
const Vendor = db.vendor

const OwnerMembersDetail = db.ownerMembersDetail;
const FlatDetail = db.flatDetail;
const Tower = db.tower;
const Society = db.society;
const User = db.user;
const Relation = db.relation;
const Otp = db.otp;
const Role = db.role;
const UserRoles = db.userRole;

function decrypt(key, data) {
    console.log(data);
    var decipher = crypto.createDecipher("aes-128-cbc", key);
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

  function encrypt1(key, data) {
    var cipher = crypto.createCipher("aes-128-cbc", key);
    var crypted = cipher.update(data, "utf-8", "hex");
    crypted += cipher.final("hex");
  
    return crypted;
  }

  let testSms = (contact,userName,password) => {
    const apikey = '07hlECj1sy4-ynODCNlExLsx91Pv29Zdrh0bxc1pLc';
    const number = contact;
    // const OTP = Math.floor(100000 + Math.random() * 900000);
    const message = 'Please login with this. Your userName is ' + userName + " and password is " + password + " :)";

    http.get(`http://api.textlocal.in/send/?apiKey=${apikey}&numbers=${number}&message=${message}`, function (err, data) {
        console.log('messageSend');

    });
    return;

};

  let mailToOwnerOrVendor = (owner) => {
    let email = decrypt(key,owner.email);
    let password = owner.password;
    let userName = decrypt(key,owner.userName);
    let contact = decrypt(key,owner.contact);
    testSms(contact,userName,password);
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
  

  let mailToTenantOrEmployee = (tenant) => {
    let email = decrypt1(key,tenant.email);
    let password = tenant.password;
    let userName = decrypt1(key,tenant.userName);
    let contact = decrypt1(key,tenant.contact);
    testSms(contact,userName,password);
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

exports.checkOtp = async (req,res,next) => {
    console.log("my name is atin===>", req.query);
        if(req.query.ownerId){
            let ownerId = decrypt(key,req.query.ownerId);
            console.log(ownerId);
            let owner = await Owner.findOne({where:{ownerId:ownerId,isActive:false}});
            console.log("owner====>",owner);
            if(!owner){
                return res.status(403).json(
                    {
                    otpVerified: false,    
                    message: 'Owner does not exist or have already been activated.'
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
                    message: 'Otp is invalid.Please contact admin.'
                });
                
            }
            let updatedOwner = await owner.updateAttributes({isActive:true});
            if(updatedOwner){
                //  console.log('owner Successfully activated');
                mailToOwnerOrVendor(updatedOwner);
                 let userName = decrypt(key,updatedOwner.userName);
                // set users
                let user = await User.findOne({
                    where:{userName:encrypt1(key,userName),
                    isActive:false
                    }
                });
                
                console.log("user==>",user);
                if(user){
                    let roles = await Role.findOne({
                        where: { id: 6 }
                    });
                    console.log("employee role",roles)
                    // user.setRoles(roles);
                    UserRoles.create({userId:user.userId,roleId:roles.id});
                    user.updateAttributes({isActive:true});
                }
                 return res.status(200).json(
                    {
                    otpVerified: true, 
                    message: 'Owner successfully activated. Check your email for username and password.'
                });
            }
        }

// added vendor

if(req.query.vendorId){
    let vendorId = decrypt(key,req.query.vendorId);
    console.log(vendorId);
    let vendor = await Vendor.findOne({where:{vendorId:vendorId,isActive:false}});
    console.log("vendor====>",vendor);
    if(!vendor){
        return res.status(403).json(
            {
            otpVerified: false,    
            message: 'Vendor does not exist or have already been activated.'
        });
        // return console.log("owner does not exist or have already been activated");
    }
    let otpToCheck = parseInt(req.body.otp);
    let vendorKey = vendor.vendorId;
    let findOtp = await Otp.findOne({where:{otpvalue:otpToCheck,vendorId:vendorKey}});
    if(findOtp===null || findOtp===undefined){
        //  return console.log(' your otp  is invalid');
        return res.status(200).json(
            {
            otpVerified: false,    
            message: 'Otp is invalid or expired.Please contact admin.'
        });
        
    }
    let updatedVendor = await vendor.updateAttributes({isActive:true});
    if(updatedVendor){
        //  console.log('owner Successfully activated');
         mailToOwnerOrVendor(updatedVendor);
         let userName = decrypt(key,updatedVendor.userName);
        // set users
        let user = await User.findOne({
            where:{userName:encrypt1(key,userName),
            isActive:false
            }
        });
        console.log("user==>",user);
        if(user){
            let roles = await Role.findOne({
                where: { id: 6 }
            });
            console.log("employee role",roles)
            // user.setRoles(roles);
            UserRoles.create({userId:user.userId,roleId:roles.id});
            user.updateAttributes({isActive:true});
        }
         return res.status(200).json(
            {
            otpVerified: true, 
            message: 'Vendor successfully sctivated.Check your email for username and password.'
        });
    }
}



if(req.query.employeeId){
        
    let employeeId = decrypt1(key,req.query.employeeId);
    console.log(employeeId);
    let employee = await Employee.findOne({where:{employeeId:employeeId,isActive:false}});
    if(employee===undefined || employee===null){
        return res.status(403).json(
            {
            otpVerified: false,    
            message: 'Employee does not exist or have already been activated.'
        });
    }
    let otpToCheck = parseInt(req.body.otp);
    let employeeKey = employee.employeeId;
    let findOtp = await Otp.findOne({where:{otpvalue:otpToCheck,employeeId:employeeKey}});
    if(findOtp===null || findOtp===undefined){
         return res.status(200).json(
                {
                otpVerified: false,    
                message: 'Otp is invalid or expired.Please contact admin.'
            });
    }
    let updatedEmployee = await employee.updateAttributes({isActive:true});
    console.log(updatedEmployee);
    if(updatedEmployee){
         mailToTenantOrEmployee(updatedEmployee);
        // set user
        let userName = decrypt1(key,updatedEmployee.userName);
        // set users
        let user = await User.findOne({
            where:{userName:encrypt1(key,userName)}
        });
   
        if(user){
            let roles = await Role.findOne({
                where: { id: 6 }
            });
            console.log("employee role",roles)
            // user.setRoles(roles);
            UserRoles.create({userId:user.userId,roleId:roles.id});
            user.updateAttributes({isActive:true});
        }
       
        // set roles

         return res.status(200).json(
            {
            otpVerified: true,    
            message: 'Employee successfully activated.Check your email for your username and password.'
        });
    }
    }
    

        if(req.query.tenantId){
        
        let tenantId = decrypt1(key,req.query.tenantId);
        console.log(tenantId);
        let tenant = await Tenant.findOne({where:{tenantId:tenantId,isActive:false}});
        if(tenant===undefined || tenant===null){
            return res.status(403).json(
                {
                otpVerified: false,    
                message: 'Tenant does not exist or have already been activated.'
            });
        }
        let otpToCheck = parseInt(req.body.otp);
        let tenantKey = tenant.tenantId;
        let findOtp = await Otp.findOne({where:{otpvalue:otpToCheck,tenantId:tenantKey}});
        if(findOtp===null || findOtp===undefined){
             return res.status(200).json(
                    {
                    otpVerified: false,    
                    message: 'Otp is invalid or expired.Please contact admin.'
                });
        }
        let updatedTenant = await tenant.updateAttributes({isActive:true});
        console.log(updatedTenant);
        if(updatedTenant){
             mailToTenantOrEmployee(updatedTenant);

            // set user
            let userName = decrypt1(key,updatedTenant.userName);
            // set users
            let user = await User.findOne({
                where:{userName:encrypt1(key,userName)}
            });
         
            if(user){
                let roles = await Role.findOne({
                    where: { id: 6 }
                });
                console.log("employee role",roles)
                // user.setRoles(roles);
                UserRoles.create({userId:user.userId,roleId:roles.id});
                user.updateAttributes({isActive:true});
            }
           
            // set roles

             return res.status(200).json(
                {
                otpVerified: true,    
                message: 'Tenant successfully activated.Check your email for your username and password'
            });
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
    