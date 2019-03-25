const db = require('../config/db.config.js');
const httpStatus = require('http-status');
const crypto = require('crypto');
var passwordGenerator = require('generate-password');
const Nexmo = require("nexmo");
const config = require('../config/config.js');
const fs = require('fs');

const nexmo = new Nexmo(
    {
        apiKey: config.api_key,
        apiSecret: config.api_secret
    },
    { debug: true }
);

const Vendor = db.vendor;
const Service = db.service;
const ServiceDetail = db.serviceDetail;
const Rate =db.rate;
const VendorService = db.vendorService;
const Op = db.Sequelize.Op;

const key = config.secret;

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
        console.log("body===>",body);
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
        console.log("req.files===>",req.files)
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
            {model:Rate},
            {model:Service}]
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
        console.log(":::::req.body==>",req.body)
        const id = req.params.id;
        console.log(":::::id",id)
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
        const updatedVendorService = await VendorService.update(update, { where: { vendorId:id} })
        if (updatedVendor && updatedVendorService) {
            return res.status(httpStatus.OK).json({
                message: "Vendor deleted successfully",
            });
        }
    } catch (error) {
        console.log("error::",error)
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


exports.create1 = async (req, res, next) => {
    try {
        let body = req.body;
        console.log("body===>",req.body);
        let existingContact = await Vendor.findOne({
            where:{
                    isActive:true,
                    contact: encrypt(key, req.body.contact)
            }
        })
        if(existingContact){
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({message:'Contact already exists'})
        }
        let customVendorName = body.vendorName;
        const userName = customVendorName += Math.floor((Math.random() * 100) + 1);
        const password = passwordGenerator.generate({
            length: 10,
            numbers: true
        });
        const vendor = await Vendor.create({
            userName: encrypt(key,userName),
            password: password,
            vendorName: encrypt(key,body.vendorName),
            permanentAddress: encrypt(key,body.permanentAddress),
            currentAddress: encrypt(key,body.currentAddress),
            contact: encrypt(key,body.contact),
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
                userId: 1, //req.userId
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
        console.log("req.files===>",req.files)
        if (req.files) {
            // for (let i = 0; i < req.files.profilePicture.length; i++) {
                profileImage = req.files.profilePicture[0].path;
            // }
            const updateImage = {
                picture: encrypt(key,profileImage)
            };
            const imageUpdate = await Vendor.find({ where: { vendorId: vendorId } }).then(vendor => {
                return vendor.updateAttributes(updateImage)
            })
            documentOne = req.files.documentOne[0].path;
            documentTwo = req.files.documentTwo[0].path;
            const updateDocument = {
                documentOne: encrypt(key,documentOne),
                documentTwo: encrypt(key,documentTwo)
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
        console.log("vendor ==>",vendor);
        decryptedVendor = {
            userName : decrypt(key,vendor.userName),
            vendorName: decrypt(key,vendor.vendorName),
            permanentAddress: decrypt(key,vendor.permanentAddress),
            currentAddress: decrypt(key,vendor.currentAddress),
            contact:decrypt(key,vendor.contact)
        }
        return res.status(httpStatus.CREATED).json({
            message: "Please check mobile for details",
            decryptedVendor
        });
    } catch (error) {
        console.log(error);
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
            { model: VendorService , where: { isActive: true },include:[{model:Rate},{model:Service}]}]
        });
        if (vendors) {
            vendors.map(vendor => {
                vendor.userName = decrypt(key,vendor.userName);
                vendor.vendorName = decrypt(key,vendor.vendorName)
                vendor.picture = decrypt(key,vendor.picture)
                vendor.documentOne = decrypt(key,vendor.documentOne)
                vendor.documentTwo = decrypt(key,vendor.documentTwo)
                // vendor.documentOne = (vendor.documentOne).replace('\\','/');
                // vendor.documentTwo = (vendor.documentTwo).replace('\\','/');
                // vendor.documentOne = (vendor.documentOne).replace('\\','/');
                // vendor.documentTwo = (vendor.documentTwo).replace('\\','/');
                vendor.permanentAddress = decrypt(key,vendor.permanentAddress)
                vendor.currentAddress = decrypt(key,vendor.currentAddress)
                vendor.contact = decrypt(key,vendor.contact);
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





  let deletePhoto = function (vendor) {
    let x = decrypt(key,vendor.picture);
      fs.unlinkSync( x ); 
  };

  let deleteDocumentOne = function(vendor) {
    let x = decrypt(key,vendor.documentOne);
    fs.unlinkSync( x ) 

  }

  let deleteDocumentTwo = function(vendor) {
    let x = decrypt(key,vendor.documentTwo);
    fs.unlinkSync( x ); 
  }




exports.update1 = async (req, res, next) => {
    let updAttr = {};
    let attrArr = ['userName','vendorName','permanentAddress','currentAddress','contact'];
    let attrFiles = ['profilePicture','documentOne','documentTwo'];
    try {
        console.log("updating vendor");
        console.log(":::::req.body==>",req.body)
        const id = req.params.id;
        console.log(":::::id",id)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        // const empty = isEmpty(update)
        // console.log(empty)
        
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        if(req.body.contact !== undefined && req.body.contact !== null){
            let existingVendor1 = await Vendor.find({
                where: {[Op.and]: [{contact: encrypt(key, req.body.contact)}, { vendorId: {[Op.ne]: req.params.id }}]}
            
            });
            if(existingVendor1) {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: 'contact already exist'});
            }
        }
        const updatedVendor = await Vendor.find({ where: { vendorId: id } }).then(vendor => {
            // if(req.files.profilePicture[0]){
            //     deletePhoto(vendor);
            // }
            // if(req.files.documentOne[0]){
            //     deleteDocumentOne(vendor);
            // }
            // if(req.files.documentTwo[0]){
            //     deleteDocumentTwo(vendor);
            // }
        //  let findAttr = (prop) => {
        //      if(prop in req.body && req.body[prop]!==undefined) {
        //          updAttr[prop] = encrypt(key,req.body[prop]);
        //      }          
        //  }

        //  let findFiles = (prop) => {
        //      if(req.files[prop] && req.files[prop]!==undefined){
        //          if(prop === 'profilePicture'){
        //             deletePhoto(vendor);
        //              updAttr.picture = encrypt(key,req.files[prop][0].path);
        //          }
        //          if(prop === 'documentOne'){
        //             deleteDocumentOne(vendor);
        //             updAttr[prop] = encrypt(key,req.files[prop][0].path);
        //          }
        //          if(prop === 'documentTwo'){
        //             deleteDocumentTwo(vendor);
        //             updAttr[prop] = encrypt(key,req.files[prop][0].path);
        //          }
              
        //      }
        //  }
        //  attrArr.forEach(attr => findAttr(attr));
        //  attrFiles.forEach(attr => findFiles(attr));
        //  console.log(updAttr);
           attrArr.forEach(attr => {
               if(attr in req.body && req.body[attr]!==undefined && req.body[attr]!==null){
                   updAttr[attr] = encrypt(key,req.body[attr]);
               }
           })
           attrFiles.forEach(attr => {
               if(attr in req.files && req.files[attr][0]!==undefined && req.files[attr][0]!==null){
                   if(attr === 'profilePicture'){
                       deletePhoto(vendor);
                       updAttr.picture = encrypt(key,req.files[attr][0].path)
                   }
                   else if(attr === 'documentOne'){
                    deleteDocumentOne(vendor);
                    updAttr.documentOne = encrypt(key,req.files[attr][0].path);
                   }
                   else if(attr === 'documentTwo'){
                    deleteDocumentTwo(vendor);
                    updAttr.documentTwo = encrypt(key,req.files[attr][0].path);

                   }
               }

           })
            // return vendor.updateAttributes({
            //     userName:encrypt(key,req.body.userName),
            //     vendorName:encrypt(key,req.body.vendorName),
            //     picture:encrypt(key,req.files.profilePicture[0].path),
            //     documentOne:encrypt(key,req.files.documentOne[0].path),
            //     documentTwo:encrypt(key,req.files.documentTwo[0].path),
            //     permanentAddress:encrypt(key,req.body.permanentAddress),
            //     currentAddress:encrypt(key,req.body.currentAddress),
            //     contact:encrypt(key,req.body.contact),
            // })
            return vendor.updateAttributes(updAttr);
        })
        if (updatedVendor) {
            updatedVendor.userName = decrypt(key,updatedVendor.userName)
            updatedVendor.vendorName = decrypt(key,updatedVendor.vendorName)
            updatedVendor.picture = decrypt(key,updatedVendor.picture)
            updatedVendor.documentOne = decrypt(key,updatedVendor.documentOne)
            updatedVendor.documentTwo = decrypt(key,updatedVendor.documentTwo)
            updatedVendor.permanentAddress = decrypt(key,updatedVendor.permanentAddress)
            updatedVendor.currentAddress = decrypt(key,updatedVendor.currentAddress)
            updatedVendor.contact = decrypt(key,updatedVendor.contact)

            if ( req.body.vendorServiceId!==undefined && req.body.rate1!==undefined && req.body.rate1!==null && req.body.rateId1!==undefined && req.body.rateId1!==null) {
                let vendorService = await VendorService.find({
                    where:{
                        vendorId:id,
                        vendorServiceId:req.body.vendorServiceId
                    },
                    include:[{model:ServiceDetail}]
                    
                });
                vendorService.updateAttributes({
                    rateId:req.body.rateId1,
                    rate:req.body.rate1
                });
                if(req.body.serviceId){
                    vendorService.updateAttributes({
                        serviceId:req.body.serviceId
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
        const update = {isActive : false};
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        // const updatedVendor = await Vendor.find({ where: { vendorId: id } }).then(vendor => {
        //     return vendor.updateAttributes(update)
        // })

        // const updatedVendorService = await VendorService.find({ where: { vendorId: id } }).then(vendorService => {
        //     return vendorService.updateAttributes(update)
        // })
        const updatedVendorService = await VendorService.update(update, { where: { vendorServiceId:id} })
        if ( updatedVendorService) {
            return res.status(httpStatus.OK).json({
                message: "VendorService deleted successfully",
            });
        }
    } catch (error) {
        console.log("error::",error)
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


exports.updateVendorService = async (req,res,next) => {
    try{
        let updAttr = {};
        let attrArr = ['serviceId','rateId','rate'];
        console.log("updating vendor");
        console.log(":::::req.body==>",req.body)
        const id = req.params.id;
        console.log(":::::id",id)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedVendorService = await VendorService.find({ where: { vendorServiceId: id } }).then(vendorService => {
           
           attrArr.forEach(attr => {
               if(attr in req.body && req.body[attr]!==undefined && req.body[attr]!==null){
                   updAttr[attr] = req.body[attr];
               }
           })
           return vendorService.updateAttributes(updAttr);
        });
        return res.status(httpStatus.OK).json({
            message: "VendorService Updated Page",
            vendor: updatedVendorService
        });
    }catch(error){
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}




