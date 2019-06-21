const db = require('../config/db.config.js');

const httpStatus = require('http-status');
const crypto = require('crypto');
const passwordGenerator = require('generate-password');
const shortId = require('short-id');
const fs = require('fs');
const path = require('path');
const config = require('../config/config.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailjet = require('node-mailjet').connect(config.mail_public_key, config.mail_secret_key);
const randomInt = require('random-int');


const IndividualVendor = db.individualVendor;
const User = db.user;
const Service = db.service;
const RateType = db.rate;
const City = db.city;
const Location = db.location;
const Country = db.country;
const State = db.state;
const Op = db.Sequelize.Op;
const Otp = db.otp;
const Role = db.role;
const UserRoles = db.userRole;
const UserRFID = db.userRfid;
const RFID = db.rfid;
const URL = config.activationLink;
const FingerprintData = db.fingerprintData;

encrypt = (text) => {
    let key = config.secret;
    let algorithm = 'aes-128-cbc';
    let cipher = crypto.createCipher(algorithm, key);
    let encryptedText = cipher.update(text, 'utf8', 'hex');
    encryptedText += cipher.final('hex');
    return encryptedText;
}

decrypt = (text) => {
    let key = config.secret;
    let algorithm = 'aes-128-cbc';
    let decipher = crypto.createDecipher(algorithm, key);
    let decryptedText = decipher.update(text, 'hex', 'utf8');
    decryptedText += decipher.final('utf8');
    return decryptedText;
}

constraintCheck = (property, object) => {
    if ((property in object) && object[property] !== undefined && object[property] !== '' && object[property] !== null) {
        return true;
    } else {
        return false;
    }
}

constraintReturn = (checkConstraint, object, property, entry) => {
    if (checkConstraint) {
        return encrypt(object[property]);
    } else {
        return entry[property];
    }
}

referenceConstraintReturn = (checkConstraint, object, property, entry) => {
    if (checkConstraint) {
        return object[property];
    } else {
        return entry[property];
    }
}

generateRandomId = () => {
    const id = Math.floor(Math.random() * (9999999999 - 1000000000 + 1)) + 1000000000;
    return id;
}

saveToDisc = (name, fileExt, base64String, callback) => {
    console.log("HERE ", name, fileExt);
    let d = new Date();
    let pathFile = "../../public/profilePictures/" + shortId.generate() + name + d.getTime() + Math.floor(Math.random() * 1000) + "." + fileExt;
    let fileName = path.join(__dirname, pathFile);
    let dataBytes = Buffer.from(base64String, 'base64');
    // console.log(base64String);
    fs.writeFile(fileName, dataBytes, function (err) {
        if (err) {
            callback(err);
        } else {
            callback(null, pathFile);
        }
    });
}

saveToDiscDoc = (name, fileExt, base64String, callback) => {
    console.log("HERE ", name, fileExt);
    let d = new Date();
    let pathFile = "../../public/documents/" + shortId.generate() + name + d.getTime() + Math.floor(Math.random() * 1000) + "." + fileExt;
    let fileName = path.join(__dirname, pathFile);
    let dataBytes = Buffer.from(base64String, 'base64');
    // console.log(base64String);
    fs.writeFile(fileName, dataBytes, function (err) {
        if (err) {
            callback(err);
        } else {
            callback(null, pathFile);
        }
    });
}

let mailToUser = (email, individualVendorId) => {
    console.log("email=>", email);
    console.log("vendor=>", individualVendorId);
    const token = jwt.sign(
        { data: 'foo' },
        'secret', { expiresIn: '1h' });
    individualVendorId = encrypt(individualVendorId.toString());
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
                    "HTMLPart": `<b>Click on the given link to activate your account</b> <a href="${URL}/login/tokenVerification?individualVendorId=${individualVendorId}&token=${token}">click here</a>`
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


exports.create = async (req, res, next) => {
    const vendor = req.body;
    vendor.userId = req.userId;

    let randomNumber;
    randomNumber = randomInt(config.randomNumberMin, config.randomNumberMax);
    const vendorExists = await IndividualVendor.findOne({ where: { isActive: true, individualVendorId: randomNumber } });
    const userExists = await User.findOne({ where: { isActive: true, userId: randomNumber } });
    if (vendorExists !== null || userExists !== null) {
        console.log("duplicate random number")
        randomNumber = randomInt(config.randomNumberMin, config.randomNumberMax);
    }

    console.log('Body ===>', vendor);

    const uniqueId = generateRandomId();

    // const userName = vendor.firstName.replace(/ /g, '') + 'V' + uniqueId.toString(36);

    const password = passwordGenerator.generate({
        length: 10,
        numbers: true
    });

    index = vendor.fileName1.lastIndexOf('.');
    vendor.fileExt1 = vendor.fileName1.slice(index + 1);
    vendor.fileName1 = vendor.fileName1.slice(0, index);
    vendor.profilePicture = vendor.profilePicture.split(',')[1];
    index = vendor.fileName2.lastIndexOf('.');
    vendor.fileExt2 = vendor.fileName2.slice(index + 1);
    vendor.fileName2 = vendor.fileName2.slice(0, index);
    vendor.documentOne = vendor.documentOne.split(',')[1];
    index = vendor.fileName3.lastIndexOf('.');
    vendor.fileExt3 = vendor.fileName3.slice(index + 1);
    vendor.fileName3 = vendor.fileName3.slice(0, index);
    vendor.documentTwo = vendor.documentTwo.split(',')[1];

    // vendor.userName = userName;
    vendor.password = password;

    user1 = await User.findOne({ where: { [Op.and]: [{ email: encrypt(vendor.email) }, { isActive: true }] } });
    user2 = await User.findOne({ where: { [Op.and]: [{ contact: encrypt(vendor.contact) }, { isActive: true }] } });

    if (vendor['email'] !== undefined) {
        vendorEmailErr = await IndividualVendor.findOne({ where: { email: encrypt(vendor.email), isActive: true } });
    } else {
        vendorEmailErr = null;
    }
    if (vendor['contact'] !== undefined) {
        vendorContactErr = await IndividualVendor.findOne({ where: { contact: encrypt(vendor.contact), isActive: true } });
    } else {
        vendorContactErr = null;
    }

    if (vendorEmailErr !== null) {
        messageEmailErr = 'Email already in use';
    }
    else {
        messageEmailErr = '';
    }
    if (vendorContactErr !== null) {
        messageContactErr = 'Contact already in use';
    }
    else {
        messageContactErr = '';
    }

    const messageErr = {
        messageEmailErr: messageEmailErr,
        messageContactErr: messageContactErr
    };

    if ((vendor.startTime1 === '') && (vendor.startTime1 === undefined) && (vendor.startTime1 === null)) {
        vendor.startTime1 = null;
        vendor.endTime1 = null;
    }


    if ((vendor.startTime2 === '') && (vendor.startTime2 === undefined) && (vendor.startTime2 === null)) {
        vendor.startTime2 = null;
        vendor.endTime2 = null;
    }

    if (user1 === null && user2 === null) {
        if ((messageErr.messageEmailErr === '') && (messageErr.messageContactErr === '')) {
            IndividualVendor.create({
                individualVendorId: randomNumber,
                firstName: encrypt(vendor.firstName),
                lastName: encrypt(vendor.lastName),
                userName: encrypt(vendor.email),
                contact: encrypt(vendor.contact),
                email: encrypt(vendor.email),
                password: vendor.password,
                permanentAddress: encrypt(vendor.permanentAddress),
                currentAddress: encrypt(vendor.currentAddress),
                rate: encrypt(vendor.rate),
                dailyRoutine: vendor.dailyRoutine,
                startTime: vendor.startTime,
                endTime: vendor.endTime,
                startTime1: vendor.startTime1,
                endTime1: vendor.endTime1,
                startTime2: vendor.startTime2,
                endTime2: vendor.endTime2,
                userId: vendor.userId,
                cityId: vendor.cityId,
                stateId: vendor.stateId,
                countryId: vendor.countryId,
                locationId: vendor.locationId,
                serviceId: vendor.serviceId,
                rateId: vendor.rateId
            })
                .then(async vendorCreated => {
                    if (vendorCreated !== null) {

                        const roles = await Role.findOne({
                            where: {
                                id: 5
                            }
                        })

                        User.create({
                            userId: randomNumber,
                            firstName: encrypt(vendor.firstName),
                            lastName: encrypt(vendor.lastName),
                            userName: encrypt(vendor.email),
                            contact: encrypt(vendor.contact),
                            email: encrypt(vendor.email),
                            password: bcrypt.hashSync(vendor.password, 8),
                            // familyMember: encrypt(tenant.noOfMembers.toString()),
                            // parking: encrypt('...'),
                            isActive: false
                        })
                            .then(user => {
                                // user.setRoles(roles);
                                UserRoles.create({ userId: user.userId, roleId: roles.id, isActive: false });
                                UserRFID.create({ userId: user.userId, rfidId: vendor.rfidId, isActive: true });
                                FingerprintData.create({ userId: user.userId });
                            })
                        if (vendor.profilePicture) {
                            await saveToDisc(vendor.fileName1, vendor.fileExt1, vendor.profilePicture, (err, res) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(res);
                                    const updatedImage = {
                                        profilePicture: encrypt(res)
                                    };
                                    IndividualVendor.update(updatedImage, { where: { individualVendorId: vendorCreated.individualVendorId } });
                                }
                            })
                        }
                        if (vendor.documentOne) {
                            await saveToDiscDoc(vendor.fileName2, vendor.fileExt2, vendor.documentOne, (err, res) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(res);
                                    const updatedImage = {
                                        documentOne: encrypt(res)
                                    };
                                    IndividualVendor.update(updatedImage, { where: { individualVendorId: vendorCreated.individualVendorId } });
                                }
                            })
                        }
                        if (vendor.documentTwo) {
                            await saveToDiscDoc(vendor.fileName3, vendor.fileExt3, vendor.documentTwo, (err, res) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(res);
                                    const updatedImage = {
                                        documentTwo: encrypt(res)
                                    };
                                    IndividualVendor.update(updatedImage, { where: { individualVendorId: vendorCreated.individualVendorId } });
                                }
                            })
                        }
                        console.log("individual vendor created ....", vendorCreated)
                        const message = mailToUser(req.body.email, vendorCreated.individualVendorId);
                        res.status(httpStatus.CREATED).json({
                            message: 'Vendor created successfully'
                        })
                    } else {
                        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                            message: 'Vendor not created'
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                })
        } else {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(messageErr);
        }
    } else {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
            message: 'User already exist for same email and contact'
        });
    }
}

exports.get = (req, res, next) => {
    const vendorArr = [];
    IndividualVendor.findAll(
        {
            where: { isActive: true },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: City,
                    attributes: ['cityId', 'cityName']
                },
                {
                    model: Country,
                    attributes: ['countryId', 'countryName']
                },
                {
                    model: State,
                    attributes: ['stateId', 'stateName']
                },
                {
                    model: Location,
                    attributes: ['locationId', 'locationName']
                },
                {
                    model: Service,
                    attributes: ['serviceId', 'serviceName']
                },
                {
                    model: RateType,
                    attributes: ['rateId', 'rateType']
                }
            ]
        })
        .then(vendor => {
            const promise = vendor.map(async item => {
                const rfid = await UserRFID.findOne({
                    where: {
                        userId: item.individualVendorId,
                        isActive: true
                    },
                    include: [
                        { model: RFID, where: { isActive: true }, attributes: ['rfidId', 'rfid'] }
                    ]
                });
                item.firstName = decrypt(item.firstName);
                item.lastName = decrypt(item.lastName);
                item.userName = decrypt(item.userName);
                item.contact = decrypt(item.contact);
                item.email = decrypt(item.email);
                item.permanentAddress = decrypt(item.permanentAddress);
                item.currentAddress = decrypt(item.currentAddress);
                item.rate = decrypt(item.rate);
                if (item.profilePicture !== null) {
                    item.profilePicture = decrypt(item.profilePicture);
                }
                item.documentOne = decrypt(item.documentOne);
                item.documentOne = item.documentOne.replace('../../', '');
                item.documentTwo = decrypt(item.documentTwo);
                item.documentTwo = item.documentTwo.replace('../../', '');

                item = item.toJSON();

                if (rfid !== null) {
                    item.rfid_master = {
                        rfidId: rfid.rfid_master.rfidId,
                        rfid: rfid.rfid_master.rfid
                    }
                }
                else {
                    item.rfid_master = rfid;
                }

                vendorArr.push(item);
            })
            Promise.all(promise)
                .then(result => {
                    vendorArr.sort(function (a, b) {
                        return Number(a.individualVendorId) - Number(b.individualVendorId)
                    });
                    res.status(httpStatus.OK).json({
                        vendors: vendorArr
                    })
                })
                .catch(err => {
                    console.log(err)
                })
        })
        .catch(err => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.getById = (req, res, next) => {
    const id = req.params.id;
    console.log('Id ===>', id);
    let vendorSend;

    IndividualVendor.findOne(
        {
            where: { individualVendorId: id, isActive: true },
            // order: [['createdAt', 'DESC']],
            include: [
                {
                    model: City,
                    attributes: ['cityId', 'cityName']
                },
                {
                    model: Country,
                    attributes: ['countryId', 'countryName']
                },
                {
                    model: State,
                    attributes: ['stateId', 'stateName']
                },
                {
                    model: Location,
                    attributes: ['locationId', 'locationName']
                },
                {
                    model: Service,
                    attributes: ['serviceId', 'serviceName']
                },
                {
                    model: RateType,
                    attributes: ['rateId', 'rateType']
                },
            ]
        })
        .then(async vendor => {
            const rfid = await UserRFID.findOne({
                where: {
                    userId: vendor.individualVendorId,
                    isActive: true
                },
                include: [
                    { model: RFID, where: { isActive: true }, attributes: ['rfidId', 'rfid'] }
                ]
            });
            vendor.firstName = decrypt(vendor.firstName);
            vendor.lastName = decrypt(vendor.lastName);
            vendor.userName = decrypt(vendor.userName);
            vendor.contact = decrypt(vendor.contact);
            vendor.email = decrypt(vendor.email);
            vendor.permanentAddress = decrypt(vendor.permanentAddress);
            vendor.currentAddress = decrypt(vendor.currentAddress);
            vendor.rate = decrypt(vendor.rate);
            if (vendor.profilePicture !== null) {
                vendor.profilePicture = decrypt(vendor.profilePicture);
            }
            vendor.documentOne = decrypt(vendor.documentOne);
            vendor.documentTwo = decrypt(vendor.documentTwo);

            vendor = vendor.toJSON();

            if (rfid !== null) {
                vendor.rfid_master = {
                    rfidId: rfid.rfid_master.rfidId,
                    rfid: rfid.rfid_master.rfid
                }
            }
            else {
                vendor.rfid_master = rfid;
            }

            return vendor;
        })
        .then(vendor => {
            res.status(httpStatus.OK).json({
                vendor: vendor
            })
        })
        .catch(err => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}


exports.update = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.log('Body ===>', req.body)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;

        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        // update.userId = req.userId;

        if ((update['fileName1'] !== '' && update['fileName1'] !== null && update['fileName1'] !== undefined) && (update['profilePicture'] !== '' && update['profilePicture'] !== null && update['profilePicture'] !== undefined)) {
            index = update.fileName1.lastIndexOf('.');
            update.fileExt1 = update.fileName1.slice(index + 1);
            update.fileName1 = update.fileName1.slice(0, index);
            update.profilePicture = update.profilePicture.split(',')[1];
        }
        if ((update['fileName2'] !== '' && update['fileName2'] !== null && update['fileName2'] !== undefined) && (update['documentOne'] !== '' && update['documentOne'] !== null && update['documentOne'] !== undefined)) {
            index = update.fileName2.lastIndexOf('.');
            update.fileExt2 = update.fileName2.slice(index + 1);
            update.fileName2 = update.fileName2.slice(0, index);
            update.documentOne = update.documentOne.split(',')[1];
        }
        if ((update['fileName3'] !== '' && update['fileName3'] !== null && update['fileName3'] !== undefined) && (update['documentTwo'] !== '' && update['documentTwo'] !== null && update['documentTwo'] !== undefined)) {
            index = update.fileName3.lastIndexOf('.');
            update.fileExt3 = update.fileName3.slice(index + 1);
            update.fileName3 = update.fileName3.slice(0, index);
            update.documentTwo = update.documentTwo.split(',')[1];
        }

        const vendor = await IndividualVendor.find({ where: { individualVendorId: id } });

        if (update['email'] !== undefined) {
            vendorEmailErr = await IndividualVendor.findOne({ where: { email: encrypt(update.email), isActive: true, individualVendorId: { [Op.ne]: id } } });
        } else {
            vendorEmailErr = null;
        }
        if (update['contact'] !== undefined) {
            vendorContactErr = await IndividualVendor.findOne({ where: { contact: encrypt(update.contact), isActive: true, individualVendorId: { [Op.ne]: id } } });
        } else {
            vendorContactErr = null;
        }

        if (vendorEmailErr !== null) {
            messageEmailErr = 'Email already in use';
        }
        else {
            messageEmailErr = '';
        }
        if (vendorContactErr !== null) {
            messageContactErr = 'Contact already in use';
        }
        else {
            messageContactErr = '';
        }

        const messageErr = {
            messageEmailErr: messageEmailErr,
            messageContactErr: messageContactErr
        };

        if ((messageErr.messageEmailErr === '') && (messageErr.messageContactErr === '')) {
            firstNameCheck = constraintCheck('firstName', update);
            lastNameCheck = constraintCheck('lastName', update);
            emailCheck = constraintCheck('email', update);
            contactCheck = constraintCheck('contact', update);
            permanentAddressCheck = constraintCheck('permanentAddress', update);
            rateCheck = constraintCheck('rate', update);
            currentAddressCheck = constraintCheck('currentAddress', update);
            serviceIdCheck = constraintCheck('serviceId', update);
            startTimeCheck = constraintCheck('startTime', update);
            endTimeCheck = constraintCheck('endTime', update);
            startTime1Check = constraintCheck('startTime1', update);
            endTime1Check = constraintCheck('endTime1', update);
            startTime2Check = constraintCheck('startTime2', update);
            endTime2Check = constraintCheck('endTime2', update);
            rateIdCheck = constraintCheck('rateId', update);
            locationIdCheck = constraintCheck('locationId', update);
            cityIdCheck = constraintCheck('cityId', update);
            stateIdCheck = constraintCheck('stateId', update);
            countryIdCheck = constraintCheck('countryId', update);
            dailyRoutineCheck = constraintCheck('dailyRoutine', update);

            firstName = constraintReturn(firstNameCheck, update, 'firstName', vendor);
            lastName = constraintReturn(lastNameCheck, update, 'lastName', vendor);
            contact = constraintReturn(contactCheck, update, 'contact', vendor);
            email = constraintReturn(emailCheck, update, 'email', vendor);
            permanentAddress = constraintReturn(permanentAddressCheck, update, 'permanentAddress', vendor);
            rate = constraintReturn(rateCheck, update, 'rate', vendor);
            currentAddress = constraintReturn(currentAddressCheck, update, 'currentAddress', vendor);
            startTime = referenceConstraintReturn(startTimeCheck, update, 'startTime', vendor);
            startTime1 = referenceConstraintReturn(startTime1Check, update, 'startTime1', vendor);
            startTime2 = referenceConstraintReturn(startTime2Check, update, 'startTime2', vendor);
            endTime = referenceConstraintReturn(endTimeCheck, update, 'endTime', vendor);
            endTime1 = referenceConstraintReturn(endTime1Check, update, 'endTime1', vendor);
            endTime2 = referenceConstraintReturn(endTime2Check, update, 'endTime2', vendor);
            serviceId = referenceConstraintReturn(serviceIdCheck, update, 'serviceId', vendor);
            locationId = referenceConstraintReturn(locationIdCheck, update, 'locationId', vendor);
            stateId = referenceConstraintReturn(stateIdCheck, update, 'stateId', vendor);
            cityId = referenceConstraintReturn(cityIdCheck, update, 'cityId', vendor);
            countryId = referenceConstraintReturn(countryIdCheck, update, 'countryId', vendor);
            rateId = referenceConstraintReturn(rateIdCheck, update, 'rateId', vendor);
            dailyRoutine = referenceConstraintReturn(dailyRoutineCheck, update, 'dailyRoutine', vendor);

            if ((update.profilePicture !== '') && (update.profilePicture !== null) && (update.profilePicture !== undefined)) {
                vendorImage = await IndividualVendor.find({ where: { individualVendorId: id }, attributes: ['profilePicture'] });
                fs.unlink((decrypt(vendorImage.profilePicture)).replace('../../', ''), err => {
                    if (err) {
                        console.log("File Missing ===>", err);
                    }
                    console.log('File Deleted Successfully');
                })
                await saveToDisc(update.fileName1, update.fileExt1, update.profilePicture, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(res);
                        const updatedImage = {
                            profilePicture: encrypt(res)
                        };
                        IndividualVendor.update(updatedImage, { where: { individualVendorId: id } });
                    }
                })
            }
            if ((update.documentOne !== '') && (update.documentOne !== null) && (update.documentOne !== undefined)) {
                vendorDoc = await IndividualVendor.find({ where: { individualVendorId: id }, attributes: ['documentOne'] });
                fs.unlink((decrypt(vendorDoc.documentOne)).replace('../../', ''), err => {
                    if (err) {
                        console.log("File Missing ===>", err);
                    }
                    console.log('File Deleted Successfully');
                })
                await saveToDiscDoc(update.fileName2, update.fileExt2, update.documentOne, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(res);
                        const updatedDoc = {
                            documentOne: encrypt(res)
                        };
                        IndividualVendor.update(updatedDoc, { where: { individualVendorId: id } });
                    }
                })
            }
            if ((update.documentTwo !== '') && (update.documentTwo !== null) && (update.documentTwo !== undefined)) {
                vendorDoc = await IndividualVendor.find({ where: { individualVendorId: id }, attributes: ['documentTwo'] });
                fs.unlink((decrypt(vendorDoc.documentTwo)).replace('../../', ''), err => {
                    if (err) {
                        console.log("File Missing ===>", err);
                    }
                    console.log('File Deleted Successfully');
                })
                await saveToDiscDoc(update.fileName3, update.fileExt3, update.documentTwo, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(res);
                        const updatedDoc = {
                            documentTwo: encrypt(res)
                        };
                        IndividualVendor.update(updatedDoc, { where: { individualVendorId: id } });
                    }
                })
            }

            const updates = {
                firstName: firstName,
                lastName: lastName,
                contact: contact,
                email: email,
                userName: email,
                permanentAddress: permanentAddress,
                currentAddress: currentAddress,
                rate: rate,
                startTime: startTime,
                endTime: endTime,
                startTime1: startTime1,
                endTime1: endTime1,
                startTime2: startTime2,
                endTime2: endTime2,
                cityId: cityId,
                stateId: stateId,
                countryId: countryId,
                locationId: locationId,
                serviceId: serviceId,
                rateId: rateId
            }

            IndividualVendor.find({
                where: {
                    individualVendorId: id
                }
            })
                .then(vendor => {
                    UserRFID.findOne({ where: { userId: id, isActive: true } })
                        .then(vendorRfid => {
                            if (vendorRfid !== null) {
                                vendorRfid.updateAttributes({ rfidId: update.rfidId })
                            } else {
                                UserRFID.create({
                                    userId: id,
                                    rfidId: update.rfidId
                                })
                            }
                        })
                    User.update(updates, { where: { userName: vendor.userName, isActive: true } });
                    return vendor.updateAttributes(updates);
                })
                .then(vendor => {
                    return res.status(httpStatus.CREATED).json({
                        message: "Vendor successfully updated",
                    });
                })
                .catch(err => {
                    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                })
        } else {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(messageErr);
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
        const updatedVendor = await IndividualVendor.find({ where: { individualVendorId: id } }).then(individualVendor => {
            User.update({ isActive: false }, { where: { userId: id } });
            UserRoles.update({ isActive: false }, { where: { userId: id } });
            UserRFID.update({ isActive: false }, { where: { userId: id } });
            return individualVendor.updateAttributes(update)
        })
        if (updatedVendor) {
            return res.status(httpStatus.OK).json({
                message: "Individual Vendor deleted successfully",
                individualVendor: updatedVendor
            });
        }
    } catch (error) {
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
        const updatedVendor = await IndividualVendor.update(update, { where: { individualVendorId: { [Op.in]: deleteSelected } } })
        User.update({ isActive: false }, { where: { userId: { [Op.in]: deleteSelected } } });
        UserRoles.update({ isActive: false }, { where: { userId: { [Op.in]: deleteSelected } } });
        UserRFID.update({ isActive: false }, { where: { userId: { [Op.in]: deleteSelected } } });
        if (updatedVendor) {
            return res.status(httpStatus.OK).json({
                message: "Vendors deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}