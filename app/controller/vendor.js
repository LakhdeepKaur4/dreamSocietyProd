const db = require('../config/db.config.js');
const httpStatus = require('http-status');
const crypto = require('crypto');
var passwordGenerator = require('generate-password');
const Nexmo = require("nexmo");
const config = require('../config/config.js');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailjet = require('node-mailjet').connect('5549b15ca6faa8d83f6a5748002921aa', '68afe5aeee2b5f9bbabf2489f2e8ade2');

const nexmo = new Nexmo(
    {
        apiKey: config.api_key,
        apiSecret: config.api_secret
    },
    { debug: true }
);

const User = db.user;
const Vendor = db.vendor;
const Service = db.service;
const ServiceDetail = db.serviceDetail;
const Rate = db.rate;
const VendorService = db.vendorService;
const Op = db.Sequelize.Op;
const Otp = db.otp;
const Role = db.role;
const UserRoles = db.userRole;

const key = config.secret;



setInterval(async function () {
    let ndate = new Date();
    let otps = await Otp.findAll();
    if (otps) {
        otps.map(async otp => {
            let timeStr = otp.createdAt.toString();
            let diff = Math.abs(ndate - new Date(timeStr.replace(/-/g, '/')));
            if (Math.abs(Math.floor((diff / (1000 * 60)) % 60) >= 5)) {
                // await Owner.destroy({where:{[Op.and]:[{ownerId:otp.ownerId},{isActive:false}]}});
                await otp.destroy();
                console.log("otp destroyed");
            }
        })
    }
}, 1000);

function encrypt(key, data) {
    var cipher = crypto.createCipher('aes-128-cbc', key);
    var crypted = cipher.update(data, 'utf-8', 'hex');
    crypted += cipher.final('hex');

    return crypted;
}

function encrypt1(key, data) {
    var cipher = crypto.createCipher("aes-128-cbc", key);
    var crypted = cipher.update(data, "utf-8", "hex");
    crypted += cipher.final("hex");

    return crypted;
}

function decrypt1(key, data) {
    var decipher = crypto.createDecipher("aes-128-cbc", key);
    var decrypted = decipher.update(data, "hex", "utf-8");
    decrypted += decipher.final("utf-8");

    return decrypted;
}

function decrypt(key, data) {
    var decipher = crypto.createDecipher('aes-128-cbc', key);
    var decrypted = decipher.update(data, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
}

exports.createVendor = async (req, res, next) => {
    try {
        let body = req.body;
        body.userId = req.userId;
        const vendor = await Vendor.create(body);
        return res.status(httpStatus.CREATED).json({
            message: "Vendor successfully created",
            vendor
        });
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.create = async (req, res, next) => {
    try {
        let body = req.body;
        console.log("body===>", body);
        let customVendorName = body.vendorName;
        const userName = customVendorName += Math.floor((Math.random() * 100) + 1);
        const password = passwordGenerator.generate({
            length: 10,
            numbers: true
        });
        const vendor = await Vendor.create({
            userName: userName,
            password: password,
            vendorName: body.vendorName,
            permanentAddress: body.permanentAddress,
            currentAddress: body.currentAddress,
            contact: body.contact,
            userId: req.userId,
            // document: body.document
        });
        const vendorId = vendor.vendorId;
        if (body.rate1) {
            const vendorService = await VendorService.create({
                vendorId: vendorId,
                rateId: body.rateId1,
                rate: body.rate1,
                userId: req.userId,
                serviceId: body.serviceId1
            })
        }
        if (body.rate2) {
            const vendorService = await VendorService.create({
                vendorId: vendorId,
                rateId: body.rateId2,
                rate: body.rate2,
                userId: req.userId,
                serviceId: body.serviceId2
            })
        }

        if (body.rate3) {
            const vendorService = await VendorService.create({
                vendorId: vendorId,
                rateId: body.rateId3,
                rate: body.rate3,
                userId: req.userId,
                serviceId: body.serviceId3
            })
        }
        console.log("req.files===>", req.files)
        if (req.files) {
            // for (let i = 0; i < req.files.profilePicture.length; i++) {
            profileImage = req.files.profilePicture[0].path;
            // }
            const updateImage = {
                picture: profileImage
            };
            const imageUpdate = await Vendor.find({ where: { vendorId: vendorId } }).then(vendor => {
                return vendor.updateAttributes(updateImage)
            })
            documentOne = req.files.documentOne[0].path;
            documentTwo = req.files.documentTwo[0].path;
            const updateDocument = {
                documentOne: documentOne,
                documentTwo: documentTwo
            };

            const documentUpdate = await Vendor.find({ where: { vendorId: vendorId } }).then(vendor => {
                return vendor.updateAttributes(updateDocument)
            })
        }
        const message = `Welcome to Dream society your username is ${userName} and password is ${password}.Do not share with anyone.`
        // nexmo.message.sendSms(config.number, body.contact, message, { type: 'text' }, (err, resp) => {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         console.log(resp);
        //     }
        // });
        return res.status(httpStatus.CREATED).json({
            message: "Please check mobile for details",
            vendor
        });
    } catch (error) {
        console.log(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const vendor = await VendorService.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']],
            include: [
                { model: Vendor },
                { model: Rate },
                { model: Service }]
        });
        if (vendor) {
            return res.status(httpStatus.CREATED).json({
                message: "Vendor Content Page",
                vendor: vendor
            });
        }
    } catch (error) {
        console.log(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.update = async (req, res, next) => {
    try {
        console.log("updating vendor");
        console.log(":::::req.body==>", req.body)
        const id = req.params.id;
        console.log(":::::id", id)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        // const empty = isEmpty(update)
        // console.log(empty)

        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedVendor = await Vendor.find({ where: { vendorId: id } }).then(vendor => {
            return vendor.updateAttributes(update)
        })
        if (updatedVendor) {
            return res.status(httpStatus.OK).json({
                message: "Vendor Updated Page",
                vendor: updatedVendor
            });
        }
    } catch (error) {
        console.log(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedVendor = await Vendor.find({ where: { vendorId: id } }).then(vendor => {
            return vendor.updateAttributes(update)
        })

        // const updatedVendorService = await VendorService.find({ where: { vendorId: id } }).then(vendorService => {
        //     return vendorService.updateAttributes(update)
        // })
        const updatedVendorService = await VendorService.update(update, { where: { vendorId: id } })
        if (updatedVendor && updatedVendorService) {
            return res.status(httpStatus.OK).json({
                message: "Vendor deleted successfully",
            });
        }
    } catch (error) {
        console.log("error::", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.deleteSelected = async (req, res, next) => {
    try {
        const deleteSelected = req.body.ids;
        console.log("delete selected==>", deleteSelected);

        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const updatedVendor = await Vendor.update(update, { where: { vendorId: { [Op.in]: deleteSelected } } })
        const updatedServices = await VendorService.update(update, { where: { vendorId: { [Op.in]: deleteSelected } } })


        if (updatedVendor && updatedServices) {
            return res.status(httpStatus.OK).json({
                message: "Vendors deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


let mailToUser = (email, vendorId) => {
    console.log("email=>", email);
    console.log("vendor=>", vendorId);
    const token = jwt.sign(
        { data: 'foo' },
        'secret', { expiresIn: '1h' });
    vendorId = encrypt(key, vendorId.toString());
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
                    "HTMLPart": `<b>Click on the given link to activate your account</b> <a href="http://mydreamsociety.com/login/tokenVerification?vendorId=${vendorId}&token=${token}">click here</a>`
                }
            ]
        })
    request.then((result) => {
        console.log(result.body)
        // console.log(`http://192.168.1.105:3000/submitotp?userId=${encryptedId}token=${encryptedToken}`);
    })
        .catch((err) => {
            console.log(err.statusCode)
        })
}



exports.create1 = async (req, res, next) => {
    try {
        let body = req.body;
        console.log("body===>", req.body);
        let existingContact = await Vendor.findOne({
            where: {
                isActive: true,
                contact: encrypt(key, req.body.contact)
            }
        })
        if (existingContact) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: 'Contact already exists' })
        }
        let customVendorName = body.firstName + body.lastName;
        const userName = customVendorName += 'v' + Math.floor((Math.random() * 100) + 1);
        const password = passwordGenerator.generate({
            length: 10,
            numbers: true
        });
        const vendor = await Vendor.create({
            userName: encrypt(key, userName),
            password: password,
            firstName: encrypt(key, body.firstName),
            lastName: encrypt(key, body.lastName),
            permanentAddress: encrypt(key, body.permanentAddress),
            currentAddress: encrypt(key, body.currentAddress),
            contact: encrypt(key, body.contact),
            email: encrypt(key, body.email),
            userId: req.userId
            // document: body.document
        });
        const vendorId = vendor.vendorId;
        if (body.rate1) {
            console.log("in here rate 1")
            const vendorService = await VendorService.create({
                vendorId: vendorId,
                rateId: body.rateId1,
                rate: body.rate1,
                userId: req.userId,
                serviceId: body.serviceId1
            })
        }
        if (body.rate2) {
            console.log("in here rate 2")
            const vendorService = await VendorService.create({
                vendorId: vendorId,
                rateId: body.rateId2,
                rate: body.rate2,
                userId: req.userId,
                serviceId: body.serviceId2
            })
        }

        if (body.rate3) {
            console.log("in here rate 3")
            const vendorService = await VendorService.create({
                vendorId: vendorId,
                rateId: body.rateId3,
                rate: body.rate3,
                userId: req.userId,
                serviceId: body.serviceId3
            })
        }
        console.log("req.files===>", req.files)
        if (req.files) {
            // for (let i = 0; i < req.files.profilePicture.length; i++) {
            profileImage = req.files.profilePicture[0].path;
            // }
            const updateImage = {
                picture: encrypt(key, profileImage)
            };
            const imageUpdate = await Vendor.find({ where: { vendorId: vendorId } }).then(vendor => {
                return vendor.updateAttributes(updateImage)
            })
            documentOne = req.files.documentOne[0].path;
            documentTwo = req.files.documentTwo[0].path;
            const updateDocument = {
                documentOne: encrypt(key, documentOne),
                documentTwo: encrypt(key, documentTwo)
            };

            const documentUpdate = await Vendor.find({ where: { vendorId: vendorId } }).then(vendor => {
                return vendor.updateAttributes(updateDocument)
            })
        }
        const message1 = `Welcome to Dream society your username is ${userName} and password is ${password}.Do not share with anyone.`
        console.log("vendor ==>", vendor);
        decryptedVendor = {
            userName: decrypt(key, vendor.userName),
            firstName: decrypt(key, vendor.firstName),
            lastName: decrypt(key, vendor.lastName),
            permanentAddress: decrypt(key, vendor.permanentAddress),
            currentAddress: decrypt(key, vendor.currentAddress),
            contact: decrypt(key, vendor.contact)
        }

        if (decryptedVendor.firstName && decryptedVendor.lastName !== '') {
            firstName = decrypt(key, vendor.firstName);
            lastName = decrypt(key, vendor.lastName)
        }
        else if (decryptedVendor.firstName && decryptedVendor.lastName === '') {
            firstName = decrypt(key, vendor.firstName);
            lastName = '...';
        }


        let vendorUserName = decrypt(key, vendor.userName);
        let email = decrypt(key, vendor.email);
        // set users
        let user = await User.create({
            firstName: encrypt1(key, firstName),
            lastName: encrypt1(key, lastName),
            userName: encrypt1(key, vendorUserName),
            password: bcrypt.hashSync(vendor.password, 8),
            contact: encrypt1(key, vendor.contact),
            email: encrypt1(key, email),
            isActive: false
        });
        // set roles
        console.log(vendor.password);
        console.log(user.password);
        let roles = await Role.findOne({
            where: { id: 5 }
        });

        // user.setRoles(roles);
        UserRoles.create({ userId: user.userId, roleId: roles.id });
        console.log("in api email", email);
        console.log("in api vendor id-->", vendorId)
        const message = mailToUser(req.body.email, vendorId);
        return res.status(httpStatus.CREATED).json({
            message: "Vendor successfully created. please activate your account. click on the link delievered to your given email"
        });
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get1 = async (req, res, next) => {
    let newvendors = [];
    try {
        const vendors = await Vendor.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']],
            include: [
                { model: VendorService, where: { isActive: true }, include: [{ model: Rate }, { model: Service }] }]
        });
        if (vendors) {
            vendors.map(vendor => {
                vendor.userName = decrypt(key, vendor.userName);
                vendor.firstName = decrypt(key, vendor.firstName);
                vendor.lastName = decrypt(key, vendor.lastName)
                vendor.picture = decrypt(key, vendor.picture)
                vendor.email = decrypt(key, vendor.email);
                vendor.documentOne = decrypt(key, vendor.documentOne)
                vendor.documentTwo = decrypt(key, vendor.documentTwo)
                // vendor.documentOne = (vendor.documentOne).replace('\\','/');
                // vendor.documentTwo = (vendor.documentTwo).replace('\\','/');
                // vendor.documentOne = (vendor.documentOne).replace('\\','/');
                // vendor.documentTwo = (vendor.documentTwo).replace('\\','/');
                vendor.permanentAddress = decrypt(key, vendor.permanentAddress)
                vendor.currentAddress = decrypt(key, vendor.currentAddress)
                vendor.contact = decrypt(key, vendor.contact);
                newvendors.push(vendor);

            })
            return res.status(httpStatus.CREATED).json({
                message: "Vendor Content Page",
                vendor: newvendors
            });
        }
    } catch (error) {
        console.log(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


// let deletePhoto = function (vendor) {
//     let x = decrypt(key,vendor.picture);
//     // let y = x.lastIndexOf('/');
//     // let z = x.substring(y+1);
//     // console.log(decrypt(key,vendor.picture));
//       fs.unlinkSync( `C:\\Users\\ATIN\\Desktop\\dream-master\\new\\dreamSociety\\${x}`) 
//   };

//   let deleteDocumentOne = function(vendor) {
//     let x = decrypt(key,vendor.documentOne);
//     fs.unlinkSync( `C:\\Users\\ATIN\\Desktop\\dream-master\\new\\dreamSociety\\${x}`) 

//   }

//   let deleteDocumentTwo = function(vendor) {
//     let x = decrypt(key,vendor.documentTwo);
//     fs.unlinkSync( `C:\\Users\\ATIN\\Desktop\\dream-master\\new\\dreamSociety\\${x}`); 
//   }



//   let deletePhoto = function (vendor) {
//     let x = decrypt(key,vendor.picture);
//       fs.unlinkSync( x ); 
//   };

//   let deleteDocumentOne = function(vendor) {
//     let x = decrypt(key,vendor.documentOne);
//     fs.unlinkSync( x ) 

//   }

//   let deleteDocumentTwo = function(vendor) {
//     let x = decrypt(key,vendor.documentTwo);
//     fs.unlinkSync( x ); 
//   }

let deleteFile = function (photo) {
    let x = decrypt(key, photo);
    fs.unlink(x, (err) => {
        if (err) {
            console.log("file to delete is missing")
        }
    });
};

exports.update1 = async (req, res, next) => {
    let updAttr = {};
    let attrArr = ['userName', 'firstName', 'lastName', 'permanentAddress', 'currentAddress', 'contact', 'email'];
    let attrFiles = ['profilePicture', 'documentOne', 'documentTwo'];
    try {
        let existingContact = await Vendor.findOne({
            where: {
                isActive: true,
                [Op.or]: {
                    contact: encrypt(key, req.body.contact),
                    email: encrypt(key, req.body.email)
                },
                vendorId: { [Op.ne]: req.params.id }
            }
        })
        if (existingContact) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: 'Email or Contact already exists' })
        }
        console.log("updating vendor");
        console.log(":::::req.body==>", req.body)
        const id = req.params.id;
        console.log(":::::id", id)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        // const empty = isEmpty(update)
        // console.log(empty)

        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedVendor = await Vendor.find({ where: { vendorId: id } }).then(vendor => {

            attrArr.forEach(attr => {
                if (attr in req.body && req.body[attr] !== undefined && req.body[attr] !== null) {
                    updAttr[attr] = encrypt(key, req.body[attr]);
                }
            })
            attrFiles.forEach(attr => {
                if (attr in req.files && req.files[attr][0] !== undefined && req.files[attr][0] !== null) {
                    if (attr === 'profilePicture') {
                        let photoToDelete = vendor.picture
                        updAttr.picture = encrypt(key, req.files[attr][0].path)
                        deleteFile(photoToDelete);

                    }
                    else if (attr === 'documentOne') {
                        let documentOneToDelete = vendor.documentOne;
                        updAttr.documentOne = encrypt(key, req.files[attr][0].path);
                        deleteFile(documentOneToDelete);

                    }
                    else if (attr === 'documentTwo') {
                        let documentTwoToDelete = vendor.documentTwo;
                        updAttr.documentTwo = encrypt(key, req.files[attr][0].path);
                        deleteFile(documentTwoToDelete);
                    }
                }

            })
            return vendor.updateAttributes(updAttr);
        })
        if (updatedVendor) {
            updatedVendor.userName = decrypt(key, updatedVendor.userName)
            updatedVendor.firstName = decrypt(key, updatedVendor.firstName)
            updatedVendor.lastName = decrypt(key, updatedVendor.lastName)
            updatedVendor.picture = decrypt(key, updatedVendor.picture)
            updatedVendor.documentOne = decrypt(key, updatedVendor.documentOne)
            updatedVendor.documentTwo = decrypt(key, updatedVendor.documentTwo)
            updatedVendor.permanentAddress = decrypt(key, updatedVendor.permanentAddress)
            updatedVendor.currentAddress = decrypt(key, updatedVendor.currentAddress)
            updatedVendor.contact = decrypt(key, updatedVendor.contact)
            updatedVendor.email = decrypt(key, updatedVendor.email)


            if (req.body.vendorServiceId !== undefined && req.body.rate1 !== undefined && req.body.rate1 !== null && req.body.rateId1 !== undefined && req.body.rateId1 !== null) {
                let vendorService = await VendorService.find({
                    where: {
                        vendorId: id,
                        vendorServiceId: req.body.vendorServiceId
                    },
                    include: [{ model: ServiceDetail }]

                });
                vendorService.updateAttributes({
                    rateId: req.body.rateId1,
                    rate: req.body.rate1
                });
                if (req.body.serviceId) {
                    vendorService.updateAttributes({
                        serviceId: req.body.serviceId
                    });
                }
            }
            return res.status(httpStatus.OK).json({
                message: "Vendor Updated Page",
                vendor: updatedVendor
            });
        }
    } catch (error) {
        console.log(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}





exports.deleteVendorService = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = { isActive: false };
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        // const updatedVendor = await Vendor.find({ where: { vendorId: id } }).then(vendor => {
        //     return vendor.updateAttributes(update)
        // })

        // const updatedVendorService = await VendorService.find({ where: { vendorId: id } }).then(vendorService => {
        //     return vendorService.updateAttributes(update)
        // })
        const updatedVendorService = await VendorService.update(update, { where: { vendorServiceId: id } })
        if (updatedVendorService) {
            return res.status(httpStatus.OK).json({
                message: "VendorService deleted successfully",
            });
        }
    } catch (error) {
        console.log("error::", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.deleteSelectedVendorServices = async (req, res, next) => {
    try {
        const deleteSelected = req.body.ids;
        console.log("delete selected==>", deleteSelected);

        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const updatedVendor = await VendorService.update(update, { where: { vendorServiceId: { [Op.in]: deleteSelected } } })
        if (updatedVendor) {
            return res.status(httpStatus.OK).json({
                message: "VendorServices deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.updateVendorService = async (req, res, next) => {
    try {
        let updAttr = {};
        let attrArr = ['serviceId', 'rateId', 'rate'];
        console.log("updating vendor");
        console.log(":::::req.body==>", req.body)
        const id = req.params.id;
        console.log(":::::ids", req.params);
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;

        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        let ups = await VendorService.findOne({ where: { isActive: true, serviceId: req.body.serviceId, rateId: req.body.rateId, vendorId: req.body.vendorId } });
        if (ups) {
            console.log("inside ups");
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "This service already exist" });
        }

        // let test = VendorService.findAll({where:{vendorId:req.body.vendorId}});
        const updatedVendorService = await VendorService.find({ where: { vendorServiceId: id } }).then(vendorService => {

            attrArr.forEach(attr => {
                if (attr in req.body && req.body[attr] !== undefined && req.body[attr] !== null) {
                    updAttr[attr] = req.body[attr];
                }
            })
            return vendorService.updateAttributes(updAttr);
        });
        return res.status(httpStatus.OK).json({
            message: "VendorService Updated Page",
            vendor: updatedVendorService
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

