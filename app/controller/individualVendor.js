const db = require('../config/db.config.js');

const httpStatus = require('http-status');
const crypto = require('crypto');
const passwordGenerator = require('generate-password');
const shortId = require('short-id');
const config = require('../config/config.js');


const IndividualVendor = db.individualVendor;
const User = db.user;
const Service = db.service;
const RateType = db.rate;
const City = db.city;
const Location = db.location;
const Country = db.country;
const State = db.state;
const Op = db.Sequelize.Op;

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

exports.create = async (req, res, next) => {
    const vendor = req.body;
    vendor.userId = req.userId;

    console.log('Body ===>', vendor);

    const uniqueId = generateRandomId();

    const userName = vendor.firstName.replace(/ /g, '') + 'V' + uniqueId.toString(36);

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

    vendor.userName = userName;
    vendor.password = password;

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

    if ((messageErr.messageEmailErr === '') && (messageErr.messageContactErr === '')) {
        IndividualVendor.create({
            firstName: encrypt(vendor.firstName),
            lastName: encrypt(vendor.lastName),
            userName: encrypt(vendor.userName),
            contact: encrypt(vendor.contact),
            email: encrypt(vendor.email),
            password: vendor.password,
            permanentAddress: encrypt(vendor.permanentAddress),
            currentAddress: encrypt(vendor.currentAddress),
            rate: encrypt(vendor.rate),
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
                if (vendor !== null) {
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
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } else {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(messageErr);
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
                },
            ]
        })
        .then(vendor => {
            vendor.map(item => {
                item.firstName = decrypt(item.firstName);
                item.lastName = decrypt(item.lastName);
                item.userName = decrypt(item.userName);
                item.contact = decrypt(item.contact);
                item.email = decrypt(item.email);
                item.permanentAddress = decrypt(item.permanentAddress);
                item.currentAddress = decrypt(item.currentAddress);
                item.rate = decrypt(item.rate);
                vendorArr.push(item);
            })
            return vendorArr;
        })
        .then(vendors => {
            res.status(httpStatus.OK).json({
                vendors: vendors
            })
        })
        .catch(err => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}


exports.update = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.log('Body ===>',req.body)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;

        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        update.userId = req.userId;

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
            vendorEmailErr = await Tenant.findOne({ where: { email: encrypt(update.email), individualVendorId: { [Op.ne]: id } } });
        } else {
            vendorEmailErr = null;
        }
        if (update['contact'] !== undefined) {
            vendorContactErr = await Tenant.findOne({ where: { contact: encrypt(update.contact), individualVendorId: { [Op.ne]: id } } });
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

            firstName = constraintReturn(firstNameCheck, update, 'firstName', vendor);
            lastName = constraintReturn(lastNameCheck, update, 'lastName', vendor);
            contact = constraintReturn(contactCheck, update, 'contact', vendor);
            email = constraintReturn(emailCheck, update, 'email', vendor);
            permanentAddress = constraintReturn(permanentAddressCheck, update, 'permanentAddress', vendor);
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
                permanentAddress: permanentAddress,
                currentAddress: currentAddress,
                rate: rate,
                startTime: startTime,
                endTime: endTime,
                startTime1: startTime1,
                endTime1: endTime1,
                startTime2: startTime2,
                endTime2: endTime2,
                userId: userId,
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




