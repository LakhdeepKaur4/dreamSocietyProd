const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');
const crypto = require('crypto');

const Society = db.society;
const City = db.city;
const location = db.location;
const Country = db.country;
const State = db.state;
const User = db.user;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
    console.log("creating society");
    console.log("::::body==>", req.body);
    Society.create({
        societyName: req.body.societyName,
        cityId: req.body.cityId,
        countryId: req.body.countryId,
        locationId: req.body.locationId,
        stateId: req.body.stateId,
        societyAddress: req.body.societyAddress,
        contactNumber: req.body.contactNumber,
        registrationNumber: req.body.registrationNumber,
        totalBoardMembers: req.body.totalBoardMembers,
        bankName: req.body.bankName,
        email: req.body.email,
        IFSCCode: req.body.IFSCCode,
        accountHolderName: req.body.accountHolderName,
        accountNumber: req.body.accountNumber,
        userId: req.userId,
    }).then(society => {
        res.json({ message: "Society added successfully!", society: society });
    }).catch(err => {
        res.status(500).send("Fail! Error -> " + err);
    })
}

exports.get = (req, res) => {
    Society.findAll(
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
                    model: User,
                    attributes: ['userId', 'userName']
                },
                {
                    model: location,
                    attributes: ['locationId', 'locationName']
                },
            ]
        })
        .then(society => {
            if (society) {
                res.json(society);
            } else {
                res.json({ message: 'Society Data Not Found' });
            }
        });
}


exports.getById = (req, res) => {
    console.log("society===>", req.params.id)
    Society.findOne({
        where: { locationId: req.params.id },
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
                model: User,
                attributes: ['userId', 'userName']
            },
            {
                model: location,
                attributes: ['locationId', 'locationName']
            },
        ]
    }).then(society => {
        res.status(200).json({
            "description": "Society Content Page",
            "society": society
        });
    }).catch(err => {
        res.status(500).json({
            "description": "Can not access Society Page",
            "error": err
        });
    })
}

exports.update = (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.json("Please enter id");
    }
    const updates = req.body;
    Society.find({
        where: { societyId: id }
    })
        .then(society => {
            return society.updateAttributes(updates)
        })
        .then(updatedSociety => {
            res.json({ message: "State updated successfully!", updatedSociety: updatedSociety });
        });
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
        const updatedSociety = await Society.find({ where: { societyId: id } }).then(society => {
            return society.updateAttributes(update)
        })
        if (updatedSociety) {
            return res.status(httpStatus.OK).json({
                message: "State deleted successfully",
                society: updatedSociety
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
        const updatedSociety = await Society.update(update, { where: { societyId: { [Op.in]: deleteSelected } } })
        if (updatedSociety) {
            return res.status(httpStatus.OK).json({
                message: "Societies deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

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
    if ((property in object) && object[property] !== undefined) {
        return true;
    }
    else {
        return false;
    }
}

constraintReturn = (checkConstraint, object, property, entry) => {
    if (checkConstraint) {
        return encrypt(object[property]);
    }
    else {
        return entry[property];
    }
}

referenceConstraintReturn = (checkConstraint, object, property, entry) => {
    if (checkConstraint) {
        return object[property];
    }
    else {
        return entry[property];
    }
}

exports.createEncrypted = async (req, res, next) => {
    console.log('Creating Society');
    console.log('Body ===>', req.body);

    let existSocietyName = 0;

    if (req.body['societyName'] !== undefined) {
        societyNameErr = await Society.findAll({ attributes: ['societyName'] });
    }
    else {
        societyNameErr = null;
    }

    if (societyNameErr !== null) {
        societyNameErr.map(item => {
            if ((decrypt(item.societyName)).replace(/ /g, '') === req.body.societyName.replace(/ /g, '')) {
                existSocietyName += 1;
            }
        })
    }

    if (existSocietyName !== 0) {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
            message: "Society Name already in use",
        });
    } else {
        Society.create({
            societyName: encrypt(req.body.societyName),
            societyAddress: encrypt(req.body.societyAddress),
            cityId: req.body.cityId,
            countryId: req.body.countryId,
            locationId: req.body.locationId,
            stateId: req.body.stateId,
            contactNumber: encrypt(req.body.contactNumber),
            registrationNumber: encrypt(req.body.registrationNumber),
            totalBoardMembers: encrypt(req.body.totalBoardMembers),
            bankName: encrypt(req.body.bankName),
            email: encrypt(req.body.email),
            IFSCCode: encrypt(req.body.IFSCCode),
            accountHolderName: encrypt(req.body.accountHolderName),
            accountNumber: encrypt(req.body.accountNumber),
            userId: req.userId,
        })
            .then(society => {
                society.societyName = decrypt(society.societyName);
                society.societyAddress = decrypt(society.societyAddress);
                society.contactNumber = decrypt(society.contactNumber);
                society.registrationNumber = decrypt(society.registrationNumber);
                society.totalBoardMembers = decrypt(society.totalBoardMembers);
                society.bankName = decrypt(society.bankName);
                society.email = decrypt(society.email);
                society.IFSCCode = decrypt(society.IFSCCode);
                society.accountHolderName = decrypt(society.accountHolderName);
                society.accountNumber = decrypt(society.accountNumber);
                res.json({ message: "Society added successfully!", society: society });
            })
            .catch(err => {
                res.status(500).send("Fail! Error -> " + err);
            })
    }
}

exports.getDecrypted = (req, res, next) => {
    const societyArr = [];
    Society.findAll(
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
                    model: User,
                    attributes: ['userId', 'userName']
                },
                {
                    model: location,
                    attributes: ['locationId', 'locationName']
                },
            ]
        })
        .then(society => {
            society.map(item => {
                item.societyName = decrypt(item.societyName);
                item.societyAddress = decrypt(item.societyAddress);
                item.contactNumber = decrypt(item.contactNumber);
                item.registrationNumber = decrypt(item.registrationNumber);
                item.totalBoardMembers = decrypt(item.totalBoardMembers);
                item.bankName = decrypt(item.bankName);
                item.email = decrypt(item.email);
                item.IFSCCode = decrypt(item.IFSCCode);
                item.accountHolderName = decrypt(item.accountHolderName);
                item.accountNumber = decrypt(item.accountNumber);
                societyArr.push(item);
            })
            return societyArr;
        })
        .then(society => {
            if (society) {
                res.json(society);
            } else {
                res.json({ message: 'Society Data Not Found' });
            }
        })
        .catch(err => {
            res.status(500).send("Fail! Error -> " + err);
        })
}

exports.getByIdDecrypted = (req, res, next) => {
    console.log('ID ===>', req.params.id);
    Society.findOne({
        where: { locationId: req.params.id },
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
                model: User,
                attributes: ['userId', 'userName']
            },
            {
                model: location,
                attributes: ['locationId', 'locationName']
            },
        ]
    }).then(society => {
        society.societyName = decrypt(society.societyName);
        society.societyAddress = decrypt(society.societyAddress);
        society.contactNumber = decrypt(society.contactNumber);
        society.registrationNumber = decrypt(society.registrationNumber);
        society.totalBoardMembers = decrypt(society.totalBoardMembers);
        society.bankName = decrypt(society.bankName);
        society.email = decrypt(society.email);
        society.IFSCCode = decrypt(society.IFSCCode);
        society.accountHolderName = decrypt(society.accountHolderName);
        society.accountNumber = decrypt(society.accountNumber);
        res.status(200).json({
            "description": "Society Content Page",
            "society": society
        });
    }).catch(err => {
        res.status(500).json({
            "description": "Can not access Society Page",
            "error": err
        });
    })
}

exports.updateEncrypted = async (req, res, next) => {
    const id = req.params.id;
    if (!id) {
        res.json("Please enter id");
    }
    const update = req.body;

    let existSocietyName = 0;

    if (update['societyName'] !== undefined) {
        societyNameErr = await Society.findAll({ attributes: ['societyName'], where: { societyId: { [Op.ne]: id } } });
    }
    else {
        societyNameErr = null;
    }

    if (societyNameErr !== null) {
        societyNameErr.map(item => {
            if ((decrypt(item.societyName)).replace(/ /g, '') === req.body.societyName.replace(/ /g, '')) {
                existSocietyName += 1;
            }
        })
    }

    if (existSocietyName !== 0) {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
            message: "Society Name already in use",
        });
    } else {
        society = await Society.find({ where: { societyId: id } });

        societyNameCheck = constraintCheck('societyName', update);
        societyAddressCheck = constraintCheck('societyAddress', update);
        contactNumberCheck = constraintCheck('contactNumber', update);
        registrationNumberCheck = constraintCheck('registrationNumber', update);
        totalBoardMembersCheck = constraintCheck('totalBoardMembers', update);
        bankNameCheck = constraintCheck('bankName', update);
        emailCheck = constraintCheck('email', update);
        IFSCCodeCheck = constraintCheck('IFSCCode', update);
        accountHolderNameCheck = constraintCheck('accountHolderName', update);
        accountNumberCheck = constraintCheck('accountNumber', update);
        cityIdCheck = constraintCheck('cityId', update);
        countryIdCheck = constraintCheck('countryId', update);
        locationIdCheck = constraintCheck('locationId', update);
        stateIdCheck = constraintCheck('stateId', update);

        societyName = constraintReturn(societyNameCheck, update, 'societyName', society);
        societyAddress = constraintReturn(societyAddressCheck, update, 'societyAddress', society);
        contactNumber = constraintReturn(contactNumberCheck, update, 'contactNumber', society);
        registrationNumber = constraintReturn(registrationNumberCheck, update, 'registrationNumber', society);
        totalBoardMembers = constraintReturn(totalBoardMembersCheck, update, 'totalBoardMembers', society);
        bankName = constraintReturn(bankNameCheck, update, 'bankName', society);
        email = constraintReturn(emailCheck, update, 'email', society);
        IFSCCode = constraintReturn(IFSCCodeCheck, update, 'IFSCCode', society);
        accountHolderName = constraintReturn(accountHolderNameCheck, update, 'accountHolderName', society);
        accountNumber = constraintReturn(accountNumberCheck, update, 'accountNumber', society);
        cityId = referenceConstraintReturn(cityIdCheck, update, 'cityId', society);
        countryId = referenceConstraintReturn(countryIdCheck, update, 'countryId', society);
        locationId = referenceConstraintReturn(locationIdCheck, update, 'locationId', society);
        stateId = referenceConstraintReturn(stateIdCheck, update, 'stateId', society);

        const updates = {
            societyName: societyName,
            societyAddress: societyAddress,
            cityId: cityId,
            countryId: countryId,
            locationId: locationId,
            stateId: stateId,
            contactNumber: contactNumber,
            registrationNumber: registrationNumber,
            totalBoardMembers: totalBoardMembers,
            bankName: bankName,
            email: email,
            IFSCCode: IFSCCode,
            accountHolderName: accountHolderName,
            accountNumber: accountNumber,
            userId: req.userId
        }

        Society.find({
            where: { societyId: id }
        })
            .then(society => {
                return society.updateAttributes(updates)
            })
            .then(updatedSociety => {
                updatedSociety.societyName = decrypt(updatedSociety.societyName);
                updatedSociety.societyAddress = decrypt(updatedSociety.societyAddress);
                updatedSociety.contactNumber = decrypt(updatedSociety.contactNumber);
                updatedSociety.registrationNumber = decrypt(updatedSociety.registrationNumber);
                updatedSociety.totalBoardMembers = decrypt(updatedSociety.totalBoardMembers);
                updatedSociety.bankName = decrypt(updatedSociety.bankName);
                updatedSociety.email = decrypt(updatedSociety.email);
                updatedSociety.IFSCCode = decrypt(updatedSociety.IFSCCode);
                updatedSociety.accountHolderName = decrypt(updatedSociety.accountHolderName);
                updatedSociety.accountNumber = decrypt(updatedSociety.accountNumber);
                res.json({ message: "Society updated successfully!", updatedSociety: updatedSociety });
            });
    }
}