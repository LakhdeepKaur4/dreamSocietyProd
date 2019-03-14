const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');
const crypto = require('crypto');

const SocietyBoardMember = db.societyBoardMember;
const Society = db.society;
const Country = db.country;
const State = db.state;
const City = db.city;
const Location = db.location;
const Designation = db.designation;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    try {
        console.log("creating Society member");
        let body = req.body;
        body.userId = req.userId;
        const societyBoardMember = await SocietyBoardMember.create(body);
        return res.status(httpStatus.CREATED).json({
            message: "Society Board Member registered successfully",
            societyBoardMember
        });
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const societyBoardMember = await SocietyBoardMember.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']],
            include: [
                { model: Designation, attributes: ['designationId', 'designationName'] },
                { model: Country, attributes: ['countryId', 'countryName'] },
                { model: City, attributes: ['cityId', 'cityName'] },
                { model: State, attributes: ['stateId', 'stateName'] },
                { model: Location, attributes: ['locationId', 'locationName'] },
                { model: Society, attributes: ['societyId', 'societyName'] },
            ]
        });
        if (societyBoardMember) {
            return res.status(httpStatus.CREATED).json({
                message: "Society Board Member Content Page",
                societyBoardMember: societyBoardMember
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.update = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.log("id==>", id)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        console.log("update==>", update)
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const societyBoardMember = await SocietyBoardMember.find({ where: { societyBoardMemberId: id } }).then(societyBoardMember => {
            return societyBoardMember.updateAttributes(update)
        })
        if (societyBoardMember) {
            return res.status(httpStatus.OK).json({
                message: "Society Member Updated Page",
                societyBoardMember
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
        console.log("::::::update", update);
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const societyBoardMember = await SocietyBoardMember.find({ where: { societyBoardMemberId: id } }).then(societyBoardMember => {
            return societyBoardMember.updateAttributes(update)
        })
        if (societyBoardMember) {
            return res.status(httpStatus.OK).json({
                message: "Society Member deleted successfully",
                societyBoardMember
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
        const updatedSocietyBoardMember = await SocietyBoardMember.update(update, { where: { SocietyBoardMemberId: { [Op.in]: deleteSelected } } })
        if (updatedSocietyBoardMember) {
            return res.status(httpStatus.OK).json({
                message: "Society Board Members deleted successfully",
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
    if ((property in object) && object[property] !== undefined && object[property] !== '' && object[property] !== null) {
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
    try {
        console.log("Creating Society Board Member");
        let member = req.body;
        member.userId = req.userId;

        if (member['email'] !== undefined) {
            societyBoardMemberEmailErr = await SocietyBoardMember.findOne({ where: { [Op.and]: [{ isActive: true }, { email: encrypt(member.email) }] } });
        }
        else {
            societyBoardMemberEmailErr = null;
        }
        if (member['contactNumber'] !== undefined) {
            societyBoardMemberContactErr = await SocietyBoardMember.findOne({ where: { [Op.and]: [{ isActive: true }, { contactNumber: encrypt(member.contactNumber) }] } });
        }
        else {
            societyBoardMemberContactErr = null;
        }

        if (societyBoardMemberEmailErr !== null) {
            messageEmailErr = 'Email already in use';
        } else {
            messageEmailErr = '';
        }

        if (societyBoardMemberContactErr !== null) {
            messageContactErr = 'Contact already in use';
        } else {
            messageContactErr = '';
        }

        const messageErr = {
            messageEmailErr: messageEmailErr,
            messageContactErr: messageContactErr
        }

        if ((messageErr.messageEmailErr === '') && (messageErr.messageContactErr === '')) {
            const create = {
                societyBoardMemberName: encrypt(member.societyBoardMemberName),
                currentAddress: encrypt(member.currentAddress),
                permanentAddress: encrypt(member.permanentAddress),
                contactNumber: encrypt(member.contactNumber),
                panCardNumber: encrypt(member.panCardNumber),
                bankName: encrypt(member.bankName),
                accountHolderName: encrypt(member.accountHolderName),
                accountNumber: encrypt(member.accountNumber),
                email: encrypt(member.email),
                optionalMail: encrypt(member.optionalMail),
                optionalContactNumber: encrypt(member.optionalContactNumber),
                IFSCCode: encrypt(member.IFSCCode),
                dob: member.dob,
                userId: member.userId,
                societyId: member.societyId,
                designationId: member.designationId,
                countryId: member.countryId,
                stateId: member.stateId,
                cityId: member.cityId,
                locationId: member.locationId,
            }
            SocietyBoardMember.findOrCreate({
                where: {
                    contactNumber: encrypt(member.contactNumber),
                    email: encrypt(member.email),
                    isActive: true
                },
                defaults: create
            })
                .spread((societyBoardMember, created) => {
                    if (created) {
                        societyBoardMember.societyBoardMemberName = decrypt(societyBoardMember.societyBoardMemberName);
                        societyBoardMember.currentAddress = decrypt(societyBoardMember.currentAddress);
                        societyBoardMember.permanentAddress = decrypt(societyBoardMember.permanentAddress);
                        societyBoardMember.contactNumber = decrypt(societyBoardMember.contactNumber);
                        societyBoardMember.panCardNumber = decrypt(societyBoardMember.panCardNumber);
                        societyBoardMember.bankName = decrypt(societyBoardMember.bankName);
                        societyBoardMember.accountHolderName = decrypt(societyBoardMember.accountHolderName);
                        societyBoardMember.accountNumber = decrypt(societyBoardMember.accountNumber);
                        societyBoardMember.email = decrypt(societyBoardMember.email);
                        societyBoardMember.optionalMail = decrypt(societyBoardMember.optionalMail);
                        societyBoardMember.optionalContactNumber = decrypt(societyBoardMember.optionalContactNumber);
                        societyBoardMember.IFSCCode = decrypt(societyBoardMember.IFSCCode);
                        return res.status(httpStatus.CREATED).json({
                            message: "Society Board Member registered successfully",
                            societyBoardMember
                        });
                    } else {
                        console.log('Duplicate Email or Contact, member not created');
                        societyBoardMember.societyBoardMemberName = decrypt(societyBoardMember.societyBoardMemberName);
                        societyBoardMember.currentAddress = decrypt(societyBoardMember.currentAddress);
                        societyBoardMember.permanentAddress = decrypt(societyBoardMember.permanentAddress);
                        societyBoardMember.contactNumber = decrypt(societyBoardMember.contactNumber);
                        societyBoardMember.panCardNumber = decrypt(societyBoardMember.panCardNumber);
                        societyBoardMember.bankName = decrypt(societyBoardMember.bankName);
                        societyBoardMember.accountHolderName = decrypt(societyBoardMember.accountHolderName);
                        societyBoardMember.accountNumber = decrypt(societyBoardMember.accountNumber);
                        societyBoardMember.email = decrypt(societyBoardMember.email);
                        societyBoardMember.optionalMail = decrypt(societyBoardMember.optionalMail);
                        societyBoardMember.optionalContactNumber = decrypt(societyBoardMember.optionalContactNumber);
                        societyBoardMember.IFSCCode = decrypt(societyBoardMember.IFSCCode);
                        return res.status(httpStatus.CREATED).json({
                            message: "Email or Contact already exist for another user",
                            societyBoardMember
                        });
                    }
                })
        } else {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(messageErr);
        }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getDecrypted =async (req, res, next) => {
    try {
        const societyBoardMemberArr = [];
        SocietyBoardMember.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']],
            include: [
                { model: Designation, attributes: ['designationId', 'designationName'] },
                { model: Country, attributes: ['countryId', 'countryName'] },
                { model: City, attributes: ['cityId', 'cityName'] },
                { model: State, attributes: ['stateId', 'stateName'] },
                { model: Location, attributes: ['locationId', 'locationName'] },
                { model: Society, attributes: ['societyId', 'societyName'] }
            ]
        })
            .then(societyBoardMember => {
                societyBoardMember.map(item => {
                    item.societyBoardMemberName = decrypt(item.societyBoardMemberName);
                    item.currentAddress = decrypt(item.currentAddress);
                    item.permanentAddress = decrypt(item.permanentAddress);
                    item.contactNumber = decrypt(item.contactNumber);
                    item.panCardNumber = decrypt(item.panCardNumber);
                    item.bankName = decrypt(item.bankName);
                    item.accountHolderName = decrypt(item.accountHolderName);
                    item.accountNumber = decrypt(item.accountNumber);
                    item.email = decrypt(item.email);
                    item.optionalMail = decrypt(item.optionalMail);
                    item.optionalContactNumber = decrypt(item.optionalContactNumber);
                    item.IFSCCode = decrypt(item.IFSCCode);
                    item.society_master.societyName = decrypt(item.society_master.societyName);
                    societyBoardMemberArr.push(item);
                })
                return societyBoardMemberArr;
            })
            .then(societyBoardMember => {
                return res.status(httpStatus.OK).json({
                    message: "Society Board Member Content Page",
                    societyBoardMember: societyBoardMember
                });
            })
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.updateEncrypted = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.log("ID ===>", id);
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        console.log("Body ===>", update);
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }

        societyBoardMember = await SocietyBoardMember.find({ where: { societyBoardMemberId: id } });
        if (update['email'] !== undefined) {
            societyBoardMemberEmailErr = await SocietyBoardMember.findOne({ where: { [Op.and]: [{ isActive: true }, { email: encrypt(update.email) }, { societyBoardMemberId: { [Op.ne]: id } }] } });
        }
        else {
            societyBoardMemberEmailErr = null;
        }
        if (update['contactNumber'] !== undefined) {
            societyBoardMemberContactErr = await SocietyBoardMember.findOne({ where: { [Op.and]: [{ isActive: true }, { contactNumber: encrypt(update.contactNumber) }, { societyBoardMemberId: { [Op.ne]: id } }] } });
        }
        else {
            societyBoardMemberContactErr = null;
        }

        if (societyBoardMemberEmailErr !== null) {
            messageEmailErr = 'Email already in use';
        } else {
            messageEmailErr = '';
        }

        if (societyBoardMemberContactErr !== null) {
            messageContactErr = 'Contact already in use';
        } else {
            messageContactErr = '';
        }

        const messageErr = {
            messageEmailErr: messageEmailErr,
            messageContactErr: messageContactErr
        }

        if ((messageErr.messageEmailErr === '') && (messageErr.messageContactErr === '')) {
            societyBoardMemberNameCheck = constraintCheck('societyBoardMemberName', update);
            currentAddressCheck = constraintCheck('currentAddress', update);
            permanentAddressCheck = constraintCheck('permanentAddress', update);
            contactNumberCheck = constraintCheck('contactNumber', update);
            panCardNumberCheck = constraintCheck('panCardNumber', update);
            bankNameCheck = constraintCheck('bankName', update);
            accountHolderNameCheck = constraintCheck('accountHolderName', update);
            accountNumberCheck = constraintCheck('accountNumber', update);
            emailCheck = constraintCheck('email', update);
            optionalMailCheck = constraintCheck('optionalMail', update);
            optionalContactNumberCheck = constraintCheck('optionalContactNumber', update);
            IFSCCodeCheck = constraintCheck('IFSCCode', update);
            dobCheck = constraintCheck('dob', update);
            societyIdCheck = constraintCheck('societyId', update);
            designationIdCheck = constraintCheck('designationId', update);
            countryIdCheck = constraintCheck('countryId', update);
            stateIdCheck = constraintCheck('stateId', update);
            cityIdCheck = constraintCheck('cityId', update);
            locationIdCheck = constraintCheck('locationId', update);

            societyBoardMemberName = constraintReturn(societyBoardMemberNameCheck, update, 'societyBoardMemberName', societyBoardMember);
            currentAddress = constraintReturn(currentAddressCheck, update, 'currentAddress', societyBoardMember);
            permanentAddress = constraintReturn(permanentAddressCheck, update, 'permanentAddress', societyBoardMember);
            contactNumber = constraintReturn(contactNumberCheck, update, 'contactNumber', societyBoardMember);
            panCardNumber = constraintReturn(panCardNumberCheck, update, 'panCardNumber', societyBoardMember);
            bankName = constraintReturn(bankNameCheck, update, 'bankName', societyBoardMember);
            accountHolderName = constraintReturn(accountHolderNameCheck, update, 'accountHolderName', societyBoardMember);
            accountNumber = constraintReturn(accountNumberCheck, update, 'accountNumber', societyBoardMember);
            email = constraintReturn(emailCheck, update, 'email', societyBoardMember);
            optionalMail = constraintReturn(optionalMailCheck, update, 'optionalMail', societyBoardMember);
            optionalContactNumber = constraintReturn(optionalContactNumberCheck, update, 'optionalContactNumber', societyBoardMember);
            IFSCCode = constraintReturn(IFSCCodeCheck, update, 'IFSCCode', societyBoardMember);
            dob = referenceConstraintReturn(dobCheck, update, 'dob', societyBoardMember);
            societyId = referenceConstraintReturn(societyIdCheck, update, 'societyId', societyBoardMember);
            designationId = referenceConstraintReturn(designationIdCheck, update, 'designationId', societyBoardMember);
            countryId = referenceConstraintReturn(countryIdCheck, update, 'countryId', societyBoardMember);
            stateId = referenceConstraintReturn(stateIdCheck, update, 'stateId', societyBoardMember);
            cityId = referenceConstraintReturn(cityIdCheck, update, 'cityId', societyBoardMember);
            locationId = referenceConstraintReturn(locationIdCheck, update, 'locationId', societyBoardMember);

            const updates = {
                societyBoardMemberName: societyBoardMemberName,
                currentAddress: currentAddress,
                permanentAddress: permanentAddress,
                contactNumber: contactNumber,
                panCardNumber: panCardNumber,
                bankName: bankName,
                accountHolderName: accountHolderName,
                accountNumber: accountNumber,
                email: email,
                optionalMail: optionalMail,
                optionalContactNumber: optionalContactNumber,
                IFSCCode: IFSCCode,
                dob: dob,
                userId: req.userId,
                societyId: societyId,
                designationId: designationId,
                countryId: countryId,
                stateId: stateId,
                cityId: cityId,
                locationId: locationId
            }

            SocietyBoardMember.find({
                where: { societyBoardMemberId: id }
            })
                .then(societyBoardMember => {
                    return societyBoardMember.updateAttributes(updates);
                })
                .then(societyBoardMember => {
                    societyBoardMember.societyBoardMemberName = decrypt(societyBoardMember.societyBoardMemberName);
                    societyBoardMember.currentAddress = decrypt(societyBoardMember.currentAddress);
                    societyBoardMember.permanentAddress = decrypt(societyBoardMember.permanentAddress);
                    societyBoardMember.contactNumber = decrypt(societyBoardMember.contactNumber);
                    societyBoardMember.panCardNumber = decrypt(societyBoardMember.panCardNumber);
                    societyBoardMember.bankName = decrypt(societyBoardMember.bankName);
                    societyBoardMember.accountHolderName = decrypt(societyBoardMember.accountHolderName);
                    societyBoardMember.accountNumber = decrypt(societyBoardMember.accountNumber);
                    societyBoardMember.email = decrypt(societyBoardMember.email);
                    societyBoardMember.optionalMail = decrypt(societyBoardMember.optionalMail);
                    societyBoardMember.optionalContactNumber = decrypt(societyBoardMember.optionalContactNumber);
                    societyBoardMember.IFSCCode = decrypt(societyBoardMember.IFSCCode);
                    return res.status(httpStatus.OK).json({
                        message: "Society Board Member Updated Page",
                        societyBoardMember
                    });
                })
        } else {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(messageErr);
        }
    } catch (error) {
        console.log(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}