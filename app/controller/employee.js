const db = require('../config/db.config.js');
const httpStatus = require('http-status');
const config = require('../config/config');
const cron = require('node-schedule');
const crypto = require('crypto');
var passwordGenerator = require('generate-password');
var path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailjet = require('node-mailjet').connect('5549b15ca6faa8d83f6a5748002921aa', '68afe5aeee2b5f9bbabf2489f2e8ade2');

const Employee = db.employee;
// const EmployeeType =db.employeeType;
// const EmployeeWorkType =db.employeeWorkType;
const Country = db.country;
const City = db.city;
const State = db.state;
const Location = db.location;
const Op = db.Sequelize.Op;
const User = db.user;
const Otp = db.otp;
const Role = db.role;



let mailToUser = (email,employeeId) => {
    const token = jwt.sign(
      {data:'foo'},
     'secret', { expiresIn: 20 });
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
                      "HTMLPart": `<b>Click on the given link to activate your account</b> <a href="http://localhost:3000/login/tokenVerification?employeeId=${employeeId}&token=${token}">click here</a>`
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
        console.log('Body ===>', body);
        body.userId = req.userId;
        let employee;
        let employeeId;
        const password = passwordGenerator.generate({
            length: 10,
            numbers: true
        });

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
        userName = body.firstName + body.uniqueId.toString(36);
        console.log("atin------>", body.userName);

        if ((messageErr.messageEmailErr === '') && (messageErr.messageContactErr === '')) {
            await Employee
                .create({
                    uniqueId: uniqueId,
                    userName: encrypt(userName),
                    firstName: encrypt(body.firstName),
                    middleName: encrypt(body.middleName),
                    email: encrypt(body.email),
                    password:password,
                    contact: encrypt(body.contact),
                    lastName: encrypt(body.lastName),
                    salary: encrypt(body.salary),
                    address: encrypt(body.address),
                    startDate: encrypt(body.startDate),
                    serviceType: encrypt(body.serviceType),
                    // // endDate: encrypt(body.endDate),
                    userId: body.userId,
                    countryId: body.countryId,
                    stateId: body.stateId,
                    cityId: body.cityId,
                    locationId: body.locationId
                })
                .then(emp => {
                    // console.log(emp);
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
                        employee.address = decrypt(employee.address);
                        employee.startDate = decrypt(employee.startDate);
                        employee.serviceType = decrypt(employee.serviceType);
                        // // employee.endDate = decrypt(employee.endDate);
                        // employee.picture = decrypt(employee.picture);
                        // employee.documentOne = decrypt(employee.documentOne);
                        // employee.documentTwo = decrypt(employee.documentTwo);

                        
                        if(employee.firstName && employee.lastName!==''){
                            firstName = employee.firstName;
                            lastName = employee.lastName;
                        }
                        else if(employee.firstName && employee.lastName ===''){
                            firstName = employee.firstName;
                            lastName = '...';
                        }
                
                        
                    let employeeUserName = employee.userName;
                    // let email =  employee.email;
                    // set users
                    let user = await User.create({
                        firstName:encrypt(firstName),
                        lastName:encrypt(lastName),
                        userName:encrypt(employeeUserName),
                        password:bcrypt.hashSync(employee.password,8),
                        contact:encrypt(employee.contact),
                        email:encrypt(employee.email),
                        isActive:false
                    });
                    // set roles
                    console.log(employee.password);
                    console.log(employee.password);
                    let roles = await Role.find({
                        where:{id:6}
                    });
                
                    user.setRoles(roles);
                    const message = mailToUser(req.body.email,employeeId);
                    return res.status(httpStatus.CREATED).json({
                      message: "Employee successfully created. please activate your account. click on the link delievered to your given email"
                    });
                    })
                    .catch(err => console.log(err))
            }else {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(messageErr);
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
                { model: City },
                { model: State },
                { model: Location },
                { model: Country }
            ]
        })
            .then(async emp => {
                // console.log(emp);
                await emp.map(item => {
                    item.userName = decrypt(item.userName);
                    item.firstName = decrypt(item.firstName);
                    item.middleName = decrypt(item.middleName);
                    item.lastName = decrypt(item.lastName);
                    item.email = decrypt(item.email);
                    item.contact = decrypt(item.contact);
                    item.salary = decrypt(item.salary);
                    item.address = decrypt(item.address);
                    item.startDate = decrypt(item.startDate);
                    item.serviceType = decrypt(item.serviceType);
                    // // item.endDate = decrypt(item.endDate);
                    item.picture = decrypt(item.picture);
                    item.documentOne = decrypt(item.documentOne);
                    item.documentTwo = decrypt(item.documentTwo);
                    employee.push(item);
                })
                if (employee) {
                    return res.status(httpStatus.OK).json({
                        message: "Employee Content Page",
                        employee
                    });
                }
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

        if (update['email'] !== undefined) {
            employeeEmailErr = await Employee.findOne({ where: { email: encrypt(update.email), employeeId: { [Op.ne]: id } } });
        } else {
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
            addressCheck = constraintCheck('address', update);
            startDateCheck = constraintCheck('startDate', update);
            serviceTypeCheck = constraintCheck('serviceType', update);
            // // endDateCheck = constraintCheck('endDate', update);
            countryIdCheck = constraintCheck('countryId', update);
            stateIdCheck = constraintCheck('stateId', update);
            cityIdCheck = constraintCheck('cityId', update);
            locationIdCheck = constraintCheck('locationId', update);
    
            firstName = constraintReturn(firstNameCheck, update, 'firstName', employee);
            middleName = constraintReturn(middleNameCheck, update, 'middleName', employee);
            lastName = constraintReturn(lastNameCheck, update, 'lastName', employee);
            email = constraintReturn(emailCheck, update, 'email', employee);
            contact = constraintReturn(contactCheck, update, 'contact', employee);
            salary = constraintReturn(salaryCheck, update, 'salary', employee);
            address = constraintReturn(addressCheck, update, 'address', employee);
            startDate = constraintReturn(startDateCheck, update, 'startDate', employee);
            serviceType = constraintReturn(serviceTypeCheck, update, 'serviceType', employee);
            // // // endDate = constraintReturn(endDateCheck, update, 'endDate', employee);
            countryId = referenceConstraintReturn(countryIdCheck, update, 'countryId', employee);
            stateId = referenceConstraintReturn(stateIdCheck, update, 'stateId', employee);
            cityId = referenceConstraintReturn(cityIdCheck, update, 'cityId', employee);
            locationId = referenceConstraintReturn(locationIdCheck, update, 'locationId', employee);
    
            const toBeUpdated = {
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                email: email,
                contact: contact,
                salary: salary,
                address: address,
                startDate: startDate,
                serviceType: serviceType,
                // // endDate: endDate,
                userId: update.userId,
                countryId: countryId,
                stateId: stateId,
                cityId: cityId,
                locationId: locationId,
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
                    employee.userName = decrypt(employee.userName);
                    employee.firstName = decrypt(employee.firstName);
                    employee.middleName = decrypt(employee.middleName);
                    employee.lastName = decrypt(employee.lastName);
                    employee.email = decrypt(employee.email);
                    employee.contact = decrypt(employee.contact);
                    employee.salary = decrypt(employee.salary);
                    employee.address = decrypt(employee.address);
                    employee.serviceType = decrypt(employee.serviceType);
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