const db = require('../config/db.config.js');
const httpStatus = require('http-status');
const config = require('../config/config');
const crypto = require('crypto');
var passwordGenerator = require('generate-password');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailjet = require('node-mailjet').connect(config.mail_public_key, config.mail_secret_key);
const randomInt = require('random-int');

const Employee = db.employee;
const EmployeeType = db.employeeType;
const EmployeeWorkType = db.employeeWorkType;
const Country = db.country;
const City = db.city;
const State = db.state;
const Location = db.location;
const Op = db.Sequelize.Op;
const User = db.user;
const Otp = db.otp;
const Role = db.role;
const EmployeeDetail = db.employeeDetail;
const UserRoles = db.userRole;
const UserRFID = db.userRfid;
const RFID = db.rfid;
const URL = config.activationLink;
const FingerprintData = db.fingerprintData;

let mailToUser = (email, employeeId) => {
    const token = jwt.sign(
        { data: 'foo' },
        'secret', { expiresIn: '1h' });
    employeeId = encrypt(employeeId.toString());
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
                    "HTMLPart": `<b>Click on the given link to activate your account</b> <a href="${URL}/login/tokenVerification?employeeId=${employeeId}&token=${token}">click here</a>`
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
    try {
        let body = req.body;
        console.log("body::::::==>", body);
        body.userId = req.userId;
        const employee = await Employee.create(body);
        const employeeId = employee.employeeId;
        // console.log("filess=====>",req.files);
        if (req.files) {
            // for (let i = 0; i < req.files.profilePicture.length; i++) {
            profileImage = req.files.profilePicture[0].path;
            // }
            const updateImage = {
                picture: profileImage
            };
            const imageUpdate = await Employee.find({ where: { employeeId: employeeId } }).then(employee => {
                return employee.updateAttributes(updateImage)
            })
            console.log(req.files.documentOne[0].path);
            documentOne = req.files.documentOne[0].path;
            documentTwo = req.files.documentTwo[0].path;
            const updateDocument = {
                documentOne: documentOne,
                documentTwo: documentTwo
            };

            const documentUpdate = await Employee.find({ where: { employeeId: employeeId } }).then(employee => {
                return employee.updateAttributes(updateDocument)
            })
        }
        return res.status(httpStatus.CREATED).json({
            message: "Employee successfully created",
            employee
        });
    } catch (error) {
        console.log(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const employee = await Employee.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']],
            include: [
                { model: Country },
                { model: State },
                { model: Location },
                { model: City },
            ]
        });
        if (employee) {
            return res.status(httpStatus.OK).json({
                message: "Employee Content Page",
                employee
            });
        }
    } catch (error) {
        console.log(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.update = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.log("id==>", id);
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;

        console.log("update", update);

        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedEmployee = await Employee.find({ where: { employeeId: id } }).then(employee => {
            return employee.updateAttributes(update)
        })
        if (updatedEmployee) {
            return res.status(httpStatus.OK).json({
                message: "Employee Updated Page",
                updatedEmployee
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.deletePhoto = function (req, res) {
    Photos.remove({ _id: req.params.id }, function (err, photo) {
        if (err) {
            return res.send({ status: "200", response: "fail" });
        }
        fs.unlink(photo.path, function () {
            res.send({
                status: "200",
                responseType: "string",
                response: "success"
            });
        });
    });
};

exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.log("id==>", id)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        console.log("update-->", update)
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedEmployee = await Employee.find({ where: { employeeId: id } }).then(employee => {
            User.update({ isActive: false }, { where: { userId: id } });
            UserRoles.update({ isActive: false }, { where: { userId: id } });
            UserRFID.update({ isActive: false }, { where: { userId: id } });
            return employee.updateAttributes(update)
        })
        if (updatedEmployee) {
            return res.status(httpStatus.OK).json({
                message: "Employee deleted successfully",
                updatedEmployee
            });
        }
    } catch (error) {
        console.log(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Mysql error' });
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
        const updatedEmployee = await Employee.update(update, { where: { employeeId: { [Op.in]: deleteSelected } } })
        if (updatedEmployee) {
            User.update({ isActive: false }, { where: { userId: { [Op.in]: deleteSelected } } });
            UserRoles.update({ isActive: false }, { where: { userId: { [Op.in]: deleteSelected } } });
            UserRFID.update({ isActive: false }, { where: { userId: { [Op.in]: deleteSelected } } });
            return res.status(httpStatus.OK).json({
                message: "Employees deleted successfully",
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

generateRandomId = () => {
    const id = Math.floor(Math.random() * (9999999999 - 1000000000 + 1)) + 1000000000;
    return id;
}

exports.createEncrypt = async (req, res, next) => {
    try {
        let body = req.body;
        let randomNumber;
        randomNumber = randomInt(config.randomNumberMin, config.randomNumberMax);
        const employeeExists = await Employee.findOne({ where: { isActive: true, employeeId: randomNumber } });
        const userExists = await User.findOne({ where: { isActive: true, userId: randomNumber } });
        if (employeeExists !== null || userExists !== null) {
            console.log("duplicate random number")
            randomNumber = randomInt(config.randomNumberMin, config.randomNumberMax);
        }
        console.log('Body ===>', body);
        body.userId = req.userId;
        let employeeId;
        const password = passwordGenerator.generate({
            length: 10,
            numbers: true
        });

        user1 = await User.findOne({ where: { [Op.and]: [{ email: encrypt(body.email) }, { isActive: true }] } });
        user2 = await User.findOne({ where: { [Op.and]: [{ contact: encrypt(body.contact) }, { isActive: true }] } });

        if (body['email'] !== undefined) {
            bodyEmailErr = await Employee.findOne({ where: { email: encrypt(body.email), isActive: true } });
        } else {
            bodyEmailErr = null;
        }
        if (body['contact'] !== undefined) {
            bodyContactErr = await Employee.findOne({ where: { contact: encrypt(body.contact), isActive: true } });
        } else {
            bodyContactErr = null;
        }

        if (bodyEmailErr !== null) {
            messageEmailErr = 'Email already in use';
        }
        else {
            messageEmailErr = '';
        }
        if (bodyContactErr !== null) {
            messageContactErr = 'Contact already in use';
        }
        else {
            messageContactErr = '';
        }

        const messageErr = {
            messageEmailErr: messageEmailErr,
            messageContactErr: messageContactErr
        };

        const uniqueId = generateRandomId();
        console.log(uniqueId);
        body.uniqueId = uniqueId;
        body.employeeId = randomNumber;
        // userName = body.firstName + body.uniqueId.toString(36);
        // console.log("atin------>", userName);

        if (user1 === null && user2 === null) {
            if ((messageErr.messageEmailErr === '') && (messageErr.messageContactErr === '')) {
                await Employee
                    .create({
                        employeeId: body.employeeId,
                        uniqueId: uniqueId,
                        userName: encrypt(body.email),
                        firstName: encrypt(body.firstName),
                        middleName: encrypt(body.middleName),
                        email: encrypt(body.email),
                        password: password,
                        contact: encrypt(body.contact),
                        lastName: encrypt(body.lastName),
                        salary: encrypt(body.salary),
                        permanentAddress: encrypt(body.permanentAddress),
                        currentAddress: encrypt(body.currentAddress),
                        startDate: encrypt(body.startDate),
                        employeeDetailId: body.employeeDetailId,
                        // // endDate: encrypt(body.endDate),
                        userId: body.userId,
                        // countryId1: body.countryId1,
                        // stateId1: body.stateId1,
                        // cityId1: body.cityId1,
                        // locationId1: body.locationId1,
                        // countryId2: body.countryId2,
                        // stateId2: body.stateId2,
                        // cityId2: body.cityId2,
                        // locationId2: body.locationId2
                    })
                    .then(emp => {
                        console.log(emp);
                        employee = emp;
                        // console.log(emp.employeeId);
                        employeeId = emp.employeeId;
                        // console.log(employeeId);
                    })
                    .catch(err => console.log('Creation Error ===>', err))

                if (req.files) {

                    let profileImage;
                    // console.log(req.files.profilePicture[0].path);
                    profileImage = req.files.profilePicture[0].path;

                    const updateImage = {
                        picture: encrypt(profileImage)
                    };
                    // console.log(employeeId);
                    await Employee.find(
                        {
                            where: {
                                employeeId: employeeId
                            }
                        })
                        .then(employee => {
                            // console.log(employeeId);
                            employee.updateAttributes(updateImage);
                        })
                        .catch(err => console.log(err))
                    documentOne = req.files.documentOne[0].path;
                    documentTwo = req.files.documentTwo[0].path;
                    const updateDocument = {
                        documentOne: encrypt(documentOne),
                        documentTwo: encrypt(documentTwo)
                    }
                    await Employee.find({
                        where: {
                            employeeId: employeeId
                        }
                    })
                        .then(employee => {
                            employee.updateAttributes(updateDocument);
                        })
                        .catch(err => console.log(err))

                }

                Employee.find({
                    where: {
                        employeeId: employeeId
                    }
                })
                    .then(async employee => {
                        console.log(employee);
                        employee.userName = decrypt(employee.userName);
                        employee.firstName = decrypt(employee.firstName);
                        employee.middleName = decrypt(employee.middleName);
                        employee.lastName = decrypt(employee.lastName);
                        employee.email = decrypt(employee.email);
                        employee.contact = decrypt(employee.contact);
                        employee.salary = decrypt(employee.salary);
                        employee.permanentAddress = decrypt(employee.permanentAddress);
                        employee.currentAddress = decrypt(employee.currentAddress);
                        employee.startDate = decrypt(employee.startDate);
                        // employee.serviceType = decrypt(employee.serviceType);
                        // // employee.endDate = decrypt(employee.endDate);
                        // employee.picture = decrypt(employee.picture);
                        // employee.documentOne = decrypt(employee.documentOne);
                        // employee.documentTwo = decrypt(employee.documentTwo);


                        if (employee.firstName && employee.lastName !== '') {
                            firstName = employee.firstName;
                            lastName = employee.lastName;
                        }
                        else if (employee.firstName && employee.lastName === '') {
                            firstName = employee.firstName;
                            lastName = '...';
                        }


                        // let employeeUserName = employee.userName;
                        // let email =  employee.email;
                        // set users
                        let user = await User.create({
                            userId: employee.employeeId,
                            firstName: encrypt(firstName),
                            lastName: encrypt(lastName),
                            userName: encrypt(employee.email),
                            password: bcrypt.hashSync(employee.password, 8),
                            contact: encrypt(employee.contact),
                            email: encrypt(employee.email),
                            isActive: false
                        });
                        // set roles
                        // console.log(employee.password);
                        // console.log(employee.password);
                        let roles = await Role.findOne({
                            where: { id: 6 }
                        });
                        console.log("employee role", roles)
                        // user.setRoles(roles);
                        UserRoles.create({ userId: user.userId, roleId: roles.id, isActive: false });
                        UserRFID.create({ userId: user.userId, rfidId: body.rfidId });
                        FingerprintData.create({ userId: user.userId });
                        const message = mailToUser(req.body.email, employeeId);
                        return res.status(httpStatus.CREATED).json({
                            message: "Employee successfully created. please activate your account. click on the link delievered to your given email"
                        });
                    })
                    .catch(err => console.log(err))
            } else {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(messageErr);
            }
        } else {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                message: 'User already exist for same email and contact'
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getDecrypt = async (req, res, next) => {
    try {
        const employee = [];
        Employee.findAll({
            where: {
                isActive: true
            },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: EmployeeDetail,
                    include: [
                        { model: EmployeeType },
                        { model: EmployeeWorkType }
                    ]
                }
            ]
        })
            .then(async emp => {
                // console.log(emp);
                const promise = await emp.map(async item => {
                    const rfid = await UserRFID.findOne({
                        where: {
                            userId: item.employeeId,
                            isActive: true
                        },
                        include: [
                            { model: RFID, where: { isActive: true }, attributes: ['rfidId', 'rfid'] }
                        ]
                    });
                    item.userName = decrypt(item.userName);
                    item.firstName = decrypt(item.firstName);
                    item.middleName = decrypt(item.middleName);
                    item.lastName = decrypt(item.lastName);
                    item.email = decrypt(item.email);
                    item.contact = decrypt(item.contact);
                    item.salary = decrypt(item.salary);
                    item.permanentAddress = decrypt(item.permanentAddress);
                    item.currentAddress = decrypt(item.currentAddress);
                    item.startDate = decrypt(item.startDate);
                    // item.serviceType = decrypt(item.serviceType);
                    // // item.endDate = decrypt(item.endDate);
                    item.picture = decrypt(item.picture);
                    item.documentOne = decrypt(item.documentOne);
                    item.documentTwo = decrypt(item.documentTwo);

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

                    employee.push(item);
                })
                Promise.all(promise)
                    .then(result => {
                        if (employee) {
                            employee.sort(function (a, b) {
                                return Number(a.employeeId) - Number(b.employeeId)
                            });
                            return res.status(httpStatus.OK).json({
                                message: "Employee Content Page",
                                employee
                            });
                        }
                    })
                    .catch(err => {
                        console.log(err)
                    })
            })
            .catch(err => console.log(err))
    } catch (error) {
        console.log(error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.updateEncrypt = async (req, res, next) => {
    try {
        const id = req.params.id;
        // console.log(id);
        let profileImage;
        let documentOne;
        let documentTwo;
        let employee;

        console.log("ID ===>", id);

        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        update.userId = req.userId;

        console.log("Update ===>", update);

        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }

        user1 = await User.findOne({ where: { [Op.and]: [{ email: encrypt(update.email) }, { isActive: true }, { userId: { [Op.ne]: id } }] } });

        user2 = await User.findOne({ where: { [Op.and]: [{ contact: encrypt(update.contact) }, { isActive: true }, { userId: { [Op.ne]: id } }] } });


        if (update['email'] !== undefined) {
            employeeEmailErr = await Employee.findOne({ where: { email: encrypt(update.email), employeeId: { [Op.ne]: id } } });
        } else {
            userId
            employeeEmailErr = null;
        }
        if (update['contact'] !== undefined) {
            employeeContactErr = await Employee.findOne({ where: { contact: encrypt(update.contact), employeeId: { [Op.ne]: id } } });
        } else {
            employeeContactErr = null;
        }

        if (employeeEmailErr !== null) {
            messageEmailErr = 'Email already in use';
        }
        else {
            messageEmailErr = '';
        }
        if (employeeContactErr !== null) {
            messageContactErr = 'Contact already in use';
        }
        else {
            messageContactErr = '';
        }

        const messageErr = {
            messageEmailErr: messageEmailErr,
            messageContactErr: messageContactErr
        };

        if (user1 === null && user2 === null) {
            if ((messageErr.messageEmailErr === '') && (messageErr.messageContactErr === '')) {
                await Employee.find({
                    where: {
                        employeeId: id
                    }
                })
                    .then(emp => {
                        employee = emp;
                    })
                if (req.files) {
                    console.log(employee);
                    if (("profilePicture" in req.files) && (req.files.profilePicture !== undefined)) {
                        profileImage = decrypt(employee.picture)
                        fs.unlink(profileImage, err => {
                            if (err) {
                                console.log("File Missing ===>", err);
                                profileImage = encrypt(req.files.profilePicture[0].path);
                            }
                            console.log('success');
                        })
                        profileImage = encrypt(req.files.profilePicture[0].path);
                    }
                    else {
                        profileImage = employee.picture;
                    }
                    if (("documentOne" in req.files) && (req.files.documentOne !== undefined)) {
                        documentOne = decrypt(employee.documentOne)
                        fs.unlink(documentOne, err => {
                            if (err) {
                                console.log("File Missing ===>", err);
                                documentOne = encrypt(req.files.documentOne[0].path);
                            }
                            console.log('success');
                        })
                        documentOne = encrypt(req.files.documentOne[0].path);
                    }
                    else {
                        documentOne = employee.documentOne;
                    }
                    if (("documentTwo" in req.files) && (req.files.documentTwo !== undefined)) {
                        documentTwo = decrypt(employee.documentTwo)
                        fs.unlink(documentTwo, err => {
                            if (err) {
                                console.log("File Missing ===>", err);
                                documentTwo = encrypt(req.files.documentTwo[0].path);
                            }
                            console.log('success');
                        })
                        documentTwo = encrypt(req.files.documentTwo[0].path);
                    }
                    else {
                        documentTwo = employee.documentTwo;
                    }
                }
                else {
                    profileImage = employee.picture;
                    documentOne = employee.documentOne;
                    documentTwo = employee.documentTwo;
                }
                firstNameCheck = constraintCheck('firstName', update);
                middleNameCheck = constraintCheck('middleName', update);
                lastNameCheck = constraintCheck('lastName', update);
                emailCheck = constraintCheck('email', update);
                contactCheck = constraintCheck('contact', update);
                salaryCheck = constraintCheck('salary', update);
                permanentAddressCheck = constraintCheck('permanentAddress', update);
                currentAddressCheck = constraintCheck('currentAddress', update);
                startDateCheck = constraintCheck('startDate', update);
                employeeDetailIdCheck = constraintCheck('employeeDetailId', update);
                // // endDateCheck = constraintCheck('endDate', update);
                // countryId1Check = constraintCheck('countryId1', update);
                // stateId1Check = constraintCheck('stateId1', update);
                // cityId1Check = constraintCheck('cityId1', update);
                // locationId1Check = constraintCheck('locationId1', update);
                // countryId2Check = constraintCheck('countryId2', update);
                // stateId2Check = constraintCheck('stateId2', update);
                // cityId2Check = constraintCheck('cityId2', update);
                // locationId2Check = constraintCheck('locationId2', update);

                firstName = constraintReturn(firstNameCheck, update, 'firstName', employee);
                middleName = constraintReturn(middleNameCheck, update, 'middleName', employee);
                lastName = constraintReturn(lastNameCheck, update, 'lastName', employee);
                email = constraintReturn(emailCheck, update, 'email', employee);
                contact = constraintReturn(contactCheck, update, 'contact', employee);
                salary = constraintReturn(salaryCheck, update, 'salary', employee);
                permanentAddress = constraintReturn(permanentAddressCheck, update, 'permanentAddress', employee);
                currentAddress = constraintReturn(currentAddressCheck, update, 'currentAddress', employee);
                startDate = constraintReturn(startDateCheck, update, 'startDate', employee);
                employeeDetailId = referenceConstraintReturn(employeeDetailIdCheck, update, 'employeeDetailId', employee);
                // // // endDate = constraintReturn(endDateCheck, update, 'endDate', employee);
                // countryId1 = referenceConstraintReturn(countryId1Check, update, 'countryId1', employee);
                // stateId1 = referenceConstraintReturn(stateId1Check, update, 'stateId1', employee);
                // cityId1 = referenceConstraintReturn(cityId1Check, update, 'cityId1', employee);
                // locationId1 = referenceConstraintReturn(locationId1Check, update, 'locationId1', employee);
                // countryId2 = referenceConstraintReturn(countryId2Check, update, 'countryId2', employee);
                // stateId2 = referenceConstraintReturn(stateId2Check, update, 'stateId2', employee);
                // cityId2 = referenceConstraintReturn(cityId2Check, update, 'cityId2', employee);
                // locationId2 = referenceConstraintReturn(locationId2Check, update, 'locationId2', employee);

                const toBeUpdated = {
                    firstName: firstName,
                    middleName: middleName,
                    lastName: lastName,
                    email: email,
                    userName: email,
                    contact: contact,
                    salary: salary,
                    permanentAddress: permanentAddress,
                    currentAddress: currentAddress,
                    startDate: startDate,
                    employeeDetailId: employeeDetailId,
                    // // endDate: endDate,
                    userId: update.userId,
                    // countryId1: countryId1,
                    // stateId1: stateId1,
                    // cityId1: cityId1,
                    // locationId1: locationId1,
                    // countryId2: countryId2,
                    // stateId2: stateId2,
                    // cityId2: cityId2,
                    // locationId2: locationId2,
                    picture: profileImage,
                    documentOne: documentOne,
                    documentTwo: documentTwo
                };
                Employee.find({
                    where: {
                        employeeId: id
                    }
                })
                    .then(employee => {
                        return employee.updateAttributes(toBeUpdated);
                    })
                    .then(employee => {
                        toBeUpdated.userId = employee.employeeId;
                        User.update(toBeUpdated, { where: { isActive: true, userId: employee.employeeId } });
                        UserRFID.findOne({ where: { userId: id, isActive: true } })
                            .then(emplpoyeeRfid => {
                                if (emplpoyeeRfid !== null) {
                                    emplpoyeeRfid.updateAttributes({ rfidId: update.rfidId })
                                } else {
                                    UserRFID.create({
                                        userId: id,
                                        rfidId: update.rfidId
                                    })
                                }
                            })
                        employee.userName = decrypt(employee.userName);
                        employee.firstName = decrypt(employee.firstName);
                        employee.middleName = decrypt(employee.middleName);
                        employee.lastName = decrypt(employee.lastName);
                        employee.email = decrypt(employee.email);
                        employee.contact = decrypt(employee.contact);
                        employee.salary = decrypt(employee.salary);
                        employee.permanentAddress = decrypt(employee.permanentAddress);
                        employee.currentAddress = decrypt(employee.currentAddress);
                        // employee.serviceType = decrypt(employee.serviceType);
                        employee.startDate = decrypt(employee.startDate);
                        // // employee.endDate = decrypt(employee.endDate);
                        employee.picture = decrypt(employee.picture);
                        employee.documentOne = decrypt(employee.documentOne);
                        employee.documentTwo = decrypt(employee.documentTwo);
                        return res.status(httpStatus.OK).json({
                            message: "Employee Updated Page",
                            employee
                        });
                    })
                    .catch(err => console.log(err))
            } else {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(messageErr);
            }
        } else {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                message: 'User already exist for same email and contact'
            });
        }


    } catch (error) {
        console.log(error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


// exports.test = async(req,res)=>{
//     try{
//          /* run the job at 18:55:30 on Dec. 14 2018*/
//         var date = new Date(2018, 11, 14, 18, 56, 30);
//         cron.scheduleJob(date, function(){
//             console.log(new Date(), "Somthing important is going to happen today!");    
//         });
//     }catch(error){

//     }
// }