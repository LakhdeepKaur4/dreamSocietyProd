const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');
var passwordGenerator = require('generate-password');
const key = config.secret;
const fs = require('fs');
const crypto = require('crypto');
const Op = db.Sequelize.Op;
const path = require('path');
const shortId = require('short-id');

const Owner = db.owner;

const OwnerMembersDetail = db.ownerMembersDetail;
const FlatDetail = db.flatDetail;
const Tower = db.tower;
const Society = db.society;
const User = db.user;

function encrypt(key, data) {
    var cipher = crypto.createCipher('aes-256-cbc', key);
    var crypted = cipher.update(data, 'utf-8', 'hex');
    crypted += cipher.final('hex');

    return crypted;
}

function decrypt(key, data) {
    var decipher = crypto.createDecipher('aes-256-cbc', key);
    var decrypted = decipher.update(data, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
}

function saveToDisc(name,fileExt,base64String, callback){
    console.log("HERE ",name,fileExt);
    let d = new Date();
    let pathFile = "../../public/profilePictures/"+shortId.generate()+name+d.getTime()+Math.floor(Math.random()*1000)+"."+fileExt;
    let fileName = path.join(__dirname,pathFile);
    let dataBytes = Buffer.from(base64String,'base64');
    // console.log(base64String);
    fs.writeFile(fileName,dataBytes , function(err) {
        if(err) {
            callback(err);
        } else {
            callback(null,pathFile);
        }
    });
}  

exports.create = async (req, res, next) => {
    try {
        console.log("creating owner");
        let ownerBody = req.body;
        let memberBody = req.body;
        let memberId = [];
        ownerBody.userId = req.userId;
        console.log("owner body==>",ownerBody)
        let customVendorName = ownerBody.ownerName;
        const userName = customVendorName + 'O' + ownerBody.towerId + ownerBody.flatDetailId;
        console.log("userName==>", userName);
        ownerBody.userName = userName;
        const password = passwordGenerator.generate({
            length: 10,
            numbers: true
        });
        ownerBody.password = password;
        // userName: encrypt(key,userName),
        // let encryptedOwnerBody = {
        //     userName: encrypt(key, userName),
        //     password: password,
        //     ownerName: encrypt(key, ownerBody.ownerName),
        //     dob: encrypt(key, ownerBody.dob),
        //     email: encrypt(key, ownerBody.email),
        //     contact: encrypt(key, ownerBody.contact),
        //     picture: encrypt(key, ownerBody.picture),
        //     bankName: encrypt(key, ownerBody.bankName),
        //     accountHolderName: encrypt(key, ownerBody.accountHolderName),
        //     accountNumber: encrypt(key, ownerBody.accountNumber),
        //     IFSCCode: encrypt(key, ownerBody.IFSCCode),
        //     panCardNumber: encrypt(key, ownerBody.panCardNumber),
        // }
        const owner = await Owner.create(ownerBody);
        const ownerId = owner.ownerId;
        if(req.body.profilePicture){
        saveToDisc(ownerBody.fileName,ownerBody.fileExt,ownerBody.profilePicture,(err,resp)=>{
            if(err){
                console.log(err)
            }
            console.log(resp)
                // }
                const updatedImage = {
                    picture: resp
                };
                Owner.update(updatedImage, { where: { ownerId: ownerId}});
        });
        }
        if (ownerBody.noOfMembers) {
            memberBody.userId = req.userId;
            memberBody.ownerId = ownerId;
            const ownerMember =await OwnerMembersDetail.bulkCreate(ownerBody.member, { returning: true },
                {
                    fields: ["memberName", "memberDob","gender", "relationId"],
                    // updateOnDuplicate: ["name"] 
                })
            ownerMember.forEach(item =>{
                memberId.push(item.memberId)
                console.log("member id0",memberId);
            });
            const bodyToUpdate = {
                ownerId: ownerId,
                userId: req.userId
            }
            const updatedMember = await OwnerMembersDetail.update(bodyToUpdate, { where: { memberId: {[Op.in]:memberId}}});
            // const ownerMemberUpdate = await OwnerMembersDetail.find({ where: { memberId: ownerMember.memberId } }).then(ownerMember => {
            //     return ownerMember.updateAttributes(bodyToUpdate);
            // })

            // }
            // let encryptedMemberBody = {
            //     memberName: encrypt(key, ownerBody.contact),
            //     memberDob: encrypt(key, ownerBody.picture),
            //     userId: req.userId,
            // }
            // const ownerMember = await OwnerMembersDetail.create(memberBody);
            //    }
        }
        return res.status(httpStatus.CREATED).json({
            message: "Owner successfully created",
            owner
        });
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.test = async (req, res, next) => {
    try {
        console.log("creating owner");
        let ownerBody = req.body;
        let memberBody = req.body;
        ownerBody.userId = req.userId;
        let customVendorName = req.body.ownerName;
        const userName = customVendorName + 'O' + req.body.towerId + req.body.flatDetailId;
        console.log("userName==>", userName);
        ownerBody.userName = userName;
        const password = passwordGenerator.generate({
            length: 10,
            numbers: true
        });
        ownerBody.password = password;
        const owner = await Owner.create(ownerBody);
        const ownerId = owner.ownerId;
        if (req.files) {
            profileImage = req.files.profilePicture[0].path;
            // }
            const updatedImage = {
                picture: profileImage
            };
            const imageUpdate = await Owner.find({ where: { ownerId: ownerId } }).then(owner => {
                return owner.updateAttributes(updatedImage)
            })
        }
        if (ownerBody.noOfMembers) {

            // let result = [];
            // console.log("no of members===",ownerBody.noOfMembers);
            // result = Object.keys(ownerBody);
            // for (i = 1; i <= ownerBody.noOfMembers; i++) {
            //  result.forEach(item => {
            //      let memberName = item + [i];
            //      console.log(memberName);
            // if(item === 'memberName+[i]'){

            // }
            //      })
            // // let ownerMemberBody = {};
            // // let test = ownerBody.memberName1;
            // // console.log(test)
            // // console.log(test + [i])
            // // console.log(ownerBody.memberName+[i]);
            // // //  const body= {
            // // //         ownerId = ownerId,
            // // //         userId = req.userId,
            // //     }
            memberBody.userId = req.userId;
            memberBody.ownerId = ownerId;
            const ownerMember = await OwnerMembersDetail.create(memberBody);
            //    }
        }
        //    const ownerMember =  OwnerMembersDetail.bulkCreate(req.body.memberArray, 
        //         {
        //             fields:["memberName", "memberDob", "relationId"] ,
        //             // updateOnDuplicate: ["name"] 
        //         } )
        //         console.log("ownerMember==>",ownerMember);
        //         const bodyToUpdate = {
        //         ownerId :ownerId,
        //         userId:req.userId
        //         }
        //         const ownerMemberUpdate = await OwnerMember.find({ where: { memberId: ownerMember.memberId } }).then(ownerMember => {
        //             return ownerMember.updateAttributes(bodyToUpdate);
        //         })
        // }
        return res.status(httpStatus.CREATED).json({
            message: "Owner successfully created",
            owner
        });
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const owner = await Owner.findAll({
            // where: { isActive: true },
            order: [['createdAt', 'DESC']],
            // include: [{
            //     model: User,
            //     as: 'organiser',
            //     attributes: ['userId', 'userName'],
            // }]
        });
        if (owner) {
            return res.status(httpStatus.CREATED).json({
                message: "Owner Content Page",
                owner
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.testUpload = async(req,res,next) =>{
    try{
        res.send('hello');
        const file = req.files.file;

        // if (!req.files.file) return res.status(400).send("No files were uploaded.");

        file.mv(`./public/profilePictures/${req.files.file.name}`, err => {
            if (err) {
                console.log(err);
            }
        });
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getFlatNo = async (req, res, next) => {
    try {
        console.log("req.param id==>", req.params.id)
        const owner = await FlatDetail.findAll({
            // where: { towerId: req.params.id },
            where: {
                [Op.and]: [
                    { towerId: req.params.id },
                    { isActive: true }
                ]
            },
            order: [['createdAt', 'DESC']],
            include: [
                { model: Tower },
            //     // {model:FlatDetail}
            //     // include: [
            //     //     { model: Tower }
            //     // ]
            ]
        });
        if (owner) {
            return res.status(httpStatus.CREATED).json({
                message:" Flat Content Page",
                owner
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getFlatDetail = async (req, res, next) => {
    try {
        console.log("req.param id==>", req.params.id)
        const owner = await Owner.findAll({
            where: { flatDetailId: req.params.id },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Tower,
                    attributes: ['towerId', 'towerName']
                },
                {
                    model: Society,
                    attributes: ['societyId', 'societyName']
                },
                {
                    model: User,
                    attributes: ['userId', 'userName']
                },

                //     // include: [
                //     //     { model: Tower }
                //     // ]
            ]
        });
        if (owner) {
            return res.status(httpStatus.CREATED).json({
                message: "Owner Flat Content Page",
                owner
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}