const db = require("../config/db.config.js");
const config = require("../config/config.js");
const httpStatus = require("http-status");
var passwordGenerator = require("generate-password");
const key = config.secret;
const fs = require("fs");
const http = require('http');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const mailjet = require('node-mailjet').connect(config.mail_public_key, config.mail_secret_key);
const URL = config.activationLink;

const Owner = db.owner;
const Tenant = db.tenant;
const Otp = db.otp;
const OwnerFlatDetail = db.ownerFlatDetail;
const TenantMembersDetail = db.tenantMembersDetail;


function decrypt(key, data) {
    var decipher = crypto.createDecipher("aes-128-cbc", key);
    var decrypted = decipher.update(data, "hex", "utf-8");
    decrypted += decipher.final("utf-8");

    return decrypted;
}





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
                    "HTMLPart": `<b>Click on the given link to activate your account</b> <a href="${URL}/login/tokenVerification?tenantId=${tenantId}&token=${token}">click here</a>`
                }
            ]
        })
    request
        .then((result) => {
            console.log(result.query)
            // console.log(`http://192.168.1.105:3000/submitotp?userId=${encryptedId}token=${encryptedToken}`);
        })
        .catch((err) => {
            console.log(err.statusCode)
        })
}



let mailToUser1 = (email, tenantMemberId) => {
    const token = jwt.sign(
        { data: 'foo' },
        'secret', { expiresIn: '1h' });
    tenantMemberId = encrypt(tenantMemberId.toString());
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
                    "HTMLPart": `<b>Click on the given link to activate your account</b> <a href="${URL}/login/tokenVerification?tenantMemberId=${tenantMemberId}&token=${token}">click here</a>`
                }
            ]
        })
    request
        .then((result) => {
            console.log(result.query)
            // console.log(`http://192.168.1.105:3000/submitotp?userId=${encryptedId}token=${encryptedToken}`);
        })
        .catch((err) => {
            console.log(err.statusCode)
        })
}






exports.sendMailToTenant =  async (req,res,next) => {
    try{
        console.log("ownerId",req.query);
        let ownerId = decrypt(key,req.query.ownerId);
        let tenantId;
        let tenantMemberId;
        if(req.query.tenantId){
             tenantId = decrypt(key,req.query.tenantId);
             let tenant = await Tenant.findOne({where:{tenantId:tenantId,isActive:false}});
            let flatDetailId = tenant.flatDetailId;
            let email = decrypt(key,tenant.email);
            let flat = OwnerFlatDetail.findOne({where:{isActive:true,ownerId:ownerId,flatDetailId:flatDetailId}});
            if(flat){
                mailToUser(email,tenantId);
                res.status(httpStatus.CREATED).json({
                    message: "Activation link has been send to your Tenant"
                  });
            }
            else {
                res.status(httpStatus.CREATED).json({
                    message: "You are not owner of the registered Tenant's Flat. Please contact Admin. "
                  });
            }
        }
        if(req.query.tenantMemberId){
            console.log("tenantMember========>",req.query.tenantMemberId);
            tenantMemberId = decrypt(key,req.query.tenantMemberId);
            let tenantMember = await TenantMembersDetail.findOne({where:{memberId:tenantMemberId,isActive:false}});
            let tenant = Tenant.findOne({where:{isActive:true,tenantId:tenantMember.tenantId}});
            let flatDetailId = tenant.flatDetailId;
            let email = decrypt(key,tenantMember.email);
            let flat = OwnerFlatDetail.findOne({where:{isActive:true,ownerId:ownerId,flatDetailId:flatDetailId}});
            if(flat){
                mailToUser1(email,tenantMember.memberId);
                res.status(httpStatus.CREATED).json({
                    message: "Activation link has been send to your Tenant"
                  });
            }
            else {
                res.status(httpStatus.CREATED).json({
                    message: "You are not registered as owner of the registered Tenant's Flat. Please contact Admin. "
                  });
            }
       }
        
    } catch(error){
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}
