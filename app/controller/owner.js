const db = require("../config/db.config.js");
const config = require("../config/config.js");
const httpStatus = require("http-status");
var passwordGenerator = require("generate-password");
const key = config.secret;
const fs = require("fs");
const http = require('http');
const crypto = require("crypto");
const Op = db.Sequelize.Op;
const path = require("path");
const shortId = require("short-id");
const nodeMailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const jwt = require('jsonwebtoken');
const mailjet = require('node-mailjet').connect('5549b15ca6faa8d83f6a5748002921aa', '68afe5aeee2b5f9bbabf2489f2e8ade2');
const bcrypt = require('bcryptjs');
const randomInt = require('random-int');

const Owner = db.owner;

const OwnerMembersDetail = db.ownerMembersDetail;
const FlatDetail = db.flatDetail;
const Flat = db.flat;

const Tower = db.tower;
const Society = db.society;
const User = db.user;
const Relation = db.relation;
const Otp = db.otp;
const Role = db.role;
const UserRoles = db.userRole;
const Parking = db.parking;
const Slot = db.slot;
const OwnerFlatDetail = db.ownerFlatDetail;
const FlatParkingDetails = db.flatParking;
const Floor = db.floor;
const TenantFlatDetail = db.tenantFlatDetail;

function encrypt(key, data) {
  var cipher = crypto.createCipher("aes-128-cbc", key);
  var crypted = cipher.update(data, "utf-8", "hex");
  crypted += cipher.final("hex");

  return crypted;
}

function encrypt1(key, data) {
  var cipher = crypto.createCipher("aes-128-cbc", key);
  var crypted = cipher.update(data, "utf-8", "hex");
  crypted += cipher.final("hex");

  return crypted;
}

function decrypt(key, data) {
  var decipher = crypto.createDecipher("aes-128-cbc", key);
  var decrypted = decipher.update(data, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
}

function decrypt1(key, data) {
  var decipher = crypto.createDecipher("aes-128-cbc", key);
  var decrypted = decipher.update(data, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
}

function saveToDisc(name, fileExt, base64String, callback) {
  console.log("HERE ", name, fileExt);
  let d = new Date();
  let pathFile =
    "../../public/profilePictures/" +
    shortId.generate() +
    name +
    d.getTime() +
    Math.floor(Math.random() * 1000) +
    "." +
    fileExt;
  // pathFile = encrypt(key,pathFile);
  let fileName = path.join(__dirname, pathFile);
  let dataBytes = Buffer.from(base64String, "base64");
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
  try {
    console.log("creating owner");
    let ownerBody = req.body;
    let memberBody = req.body;
    let memberId = [];
    ownerBody.userId = req.userId;
    console.log("owner body==>", ownerBody);
    let customVendorName = ownerBody.ownerName;
    const userName =
      customVendorName + "O" + ownerBody.towerId + ownerBody.flatDetailId;
    console.log("userName==>", userName);
    ownerBody.userName = userName;
    const password = passwordGenerator.generate({
      length: 10,
      numbers: true
    });
    ownerBody.password = password;

    const owner = await Owner.create(ownerBody);
    const ownerId = owner.ownerId;
    if (req.body.profilePicture) {
      saveToDisc(
        ownerBody.fileName,
        ownerBody.fileExt,
        ownerBody.profilePicture,
        (err, resp) => {
          if (err) {
            console.log(err);
          }
          console.log(resp);
          // }
          const updatedImage = {
            picture: resp
          };
          Owner.update(updatedImage, {
            where: {
              ownerId: ownerId
            }
          });
        }
      );
    }
    if (ownerBody.noOfMembers) {
      memberBody.userId = req.userId;
      memberBody.ownerId = ownerId;
      const ownerMember = await OwnerMembersDetail.bulkCreate(
        ownerBody.member, {
          returning: true
        }, {
          fields: ["memberName", "memberDob", "gender", "relationId"]
          // updateOnDuplicate: ["name"]
        }
      );
      ownerMember.forEach(item => {
        memberId.push(item.memberId);
        console.log("member id0", memberId);
      });
      const bodyToUpdate = {
        ownerId: ownerId,
        userId: req.userId
      };
      console.log("bodytoUpdate ==>", bodyToUpdate);
      console.log(ownerMember.memberId);
      const updatedMember = await OwnerMembersDetail.update(bodyToUpdate, {
        where: {
          memberId: {
            [Op.in]: memberId
          }
        }
      });
    }
    return res.status(httpStatus.CREATED).json({
      message: "Owner successfully created",
      owner
    });
  } catch (error) {
    console.log("error==>", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
};

let testSms = (contact) => {
  const apikey = 'mJUH4QVvP+E-coDtRnQr7wvdVc8ClAWDcKjPew8Gxl';
  const number = contact;
  const OTP = Math.floor(100000 + Math.random() * 900000);
  const message = 'OTP-' + OTP;

  http.get(`http://api.textlocal.in/send/?apiKey=${apikey}&numbers=${number}&message=${message}`, function (err, data) {
    console.log('messageSend');

  });
  return OTP;
};


let mailToUser = (email, ownerId) => {
  const token = jwt.sign({
      data: 'foo'
    },
    'secret', {
      expiresIn: '1h'
    });
  ownerId = encrypt(key, ownerId.toString());
  const request = mailjet.post("send", {
      'version': 'v3.1'
    })
    .request({
      "Messages": [{
        "From": {
          "Email": "rohit.khandelwal@greatwits.com",
          "Name": "Greatwits"
        },
        "To": [{
          "Email": email,
          "Name": 'Atin' + ' ' + 'Tanwar'
        }],
        "Subject": "Activation link",
        "HTMLPart": `<b>Click on the given link to activate your account</b> <a href="http://mydreamsociety.com/login/tokenVerification?ownerId=${ownerId}&token=${token}">click here</a>`
      }]
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
    let fieldsArr = [""]
    console.log("creating owner");
    console.log(req.body);
    let existingOwner = await Owner.find({
      where: {
        isActive: true,
        email: encrypt(key, req.body.email)
      }
    });
    let existingUser = await User.find({
      where: {
        isActive: true,
        email: encrypt(key, req.body.email)
      }
    })
    if (existingOwner || existingUser) {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
        message: "email already exist"
      });
    }
    let existingOwner1 = await Owner.find({
      where: {
        isActive: true,
        contact: encrypt(key, req.body.contact)
      }
    });
    let existingContact = await User.find({
      where: {
        isActive: true,
        contact: encrypt(key, req.body.contact)
      }
    })
    if (existingOwner1 || existingContact) {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
        message: "contact already exist"
      });
    }
    let randomNumber;
    randomNumber = randomInt(config.randomNumberMin, config.randomNumberMax);
    const OwnerExists = await Owner.findOne({ where: { isActive: true, ownerId: randomNumber } });
    const userExists = await User.findOne({ where: { isActive: true, userId: randomNumber } });
    if (OwnerExists !== null || userExists !== null) {
        console.log("duplicate random number")
        randomNumber = randomInt(config.randomNumberMin, config.randomNumberMax);
    }
    let ownerBody = req.body;
    let memberBody = req.body;
    let memberId = [];
    ownerBody.userId = 1;
    let customVendorName = req.body.firstName + req.body.lastName;
    let userName = customVendorName + 'O' + req.body.towerId + shortId.generate();
    // console.log("userName==>", userName);
    userName = userName.replace(/ /g, '').toLowerCase();
    console.log("my name is", userName);
    let existingOwner2 = await Owner.find({
      where: {
        isActive: true,
        userName: encrypt(key, userName)
      }
    });
    if (existingOwner2) {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
        message: "The specific owner already exist"
      });
    }
    ownerBody.userName = userName;
    const password = passwordGenerator.generate({
      length: 10,
      numbers: true
    });
    ownerBody.password = password;
    ownerBody.ownerId = randomNumber;
    const owner = await Owner.create({
      // ownerName: encrypt(key, ownerBody.ownerName),
      ownerId: ownerBody.ownerId,
      firstName: encrypt(key, ownerBody.firstName),
      lastName: encrypt(key, ownerBody.lastName),
      userName: encrypt(key, ownerBody.userName),
      dob: ownerBody.dob,
      email: encrypt(key, ownerBody.email),
      contact: encrypt(key, ownerBody.contact),
      password: ownerBody.password,
      gender: encrypt(key, ownerBody.gender),
      permanentAddress: encrypt(key, ownerBody.permanentAddress),
      correspondenceAddress: encrypt(key, ownerBody.correspondenceAddress),
      adhaarCardNo: encrypt(key, ownerBody.adhaarCardNo),
      noOfMembers: ownerBody.noOfMembers,
      userId: req.userId,
      societyId: ownerBody.societyId,
      towerId: ownerBody.towerId,
      // flatDetailId: ownerBody.flatDetailId,
      floorId: ownerBody.floorId
    });

    const ownerId = owner.ownerId;
    if (ownerBody.flatDetailIds !== null && ownerBody.flatDetailIds !== undefined && ownerBody.flatDetailIds !== '') {
      OwnerFlatDetail.create({
        flatDetailId: ownerBody.flatDetailIds,
        ownerId: ownerId
      })
    }
    if (req.body.profilePicture) {
      ownerBody.profilePicture = ownerBody.profilePicture.split(",")[1]
      let fileName = ownerBody.fileName.split(".")[0];
      let fileExt = ownerBody.fileName.split(".")[1];
      saveToDisc(
        fileName,
        fileExt,
        ownerBody.profilePicture,
        (err, resp) => {
          if (err) {
            console.log(err);
          }
          console.log(resp);
          // }
          const updatedImage = {
            picture: encrypt(key, resp)
          };
          Owner.update(updatedImage, {
            where: {
              ownerId: ownerId
            }
          });
        }
      );
    }
    if (ownerBody.noOfMembers > 0) {
      let ids = [];
      let memberNewArray = [];
      memberBody.userId = req.userId;
      memberBody.ownerId = ownerId;

      req.body.member.map(member => {
        member.memberName = encrypt(key, member.memberName);
        member.gender = encrypt(key, member.gender);
        memberNewArray.push(member);
      });
      console.log("hello", memberNewArray);
      const ownerMember = await OwnerMembersDetail.bulkCreate(
        memberNewArray, {
          returning: true
        }, {
          fields: ["memberName", "memberDob", "gender", "relationId"]
          // updateOnDuplicate: ["name"]
        }
      );

      ownerMember.map(x => ids.push(x.memberId));
      const bodyToUpdate = {
        ownerId: ownerId,
        userId: req.userId,
        // relationId: req.body.relationId
      };
      console.log("bodytoUpdate ==>", bodyToUpdate);
      console.log(ownerMember.memberId);
      const updatedMember = await OwnerMembersDetail.update(bodyToUpdate, {
        where: {
          memberId: {
            [Op.in]: ids
          }
        }
      });

    }
    if (owner.firstName && owner.lastName !== '') {
      firstName = decrypt(key, owner.firstName);
      lastName = decrypt(key, owner.lastName)
    } else if (owner.firstName && owner.lastName !== '') {
      firstName = decrypt(key, owner.firstName);
      lastName = '...';
    }



    let ownerUserName = decrypt(key, owner.userName);
    let email = decrypt(key, owner.email);
    // set users
    let user = await User.create({
      userId: ownerBody.ownerId,
      firstName: encrypt1(key, firstName),
      lastName: encrypt1(key, lastName),
      userName: encrypt1(key, ownerUserName),
      password: bcrypt.hashSync(owner.password, 8),
      contact: encrypt1(key, owner.contact),
      towerId: owner.towerId,
      email: encrypt1(key, email),
      isActive: false
    });
    // set roles
    console.log(owner.password);
    console.log(user.password);
    let roles = await Role.findOne({
      where: {
        id: 3
      }
    });

    // user.setRoles(roles);
    console.log("owner role==>", roles);
    UserRoles.create({
      userId: user.userId,
      roleId: roles.id
    });
    const message = mailToUser(req.body.email, ownerId);
    return res.status(httpStatus.CREATED).json({
      message: "Owner successfully created. please activate your account. click on the link delievered to your given email"
    });
  } catch (error) {
    console.log("error==>", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
};


exports.get = async (req, res, next) => {
  try {
    const owner = await Owner.findAll({
      // where: { isActive: true },
      order: [
        ["createdAt", "DESC"]
      ]
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
    console.log("error==>", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
};

exports.get1 = async (req, res, next) => {
  let getOwners = [];
  try {
    const owners = await Owner.findAll({
      where: {
        isActive: true
      },
      order: [
        ["createdAt", "DESC"]
      ],

      include: [{
          model: OwnerMembersDetail
        },
        {
          model: FlatDetail
        },
        // include:[{model:Parking},{model:Slot}]
        {
          model: Society
        },
        {
          model: Tower
        }
      ]
    });

    // console.log(owners);

    owners.map(owner => {
      owner.firstName = decrypt(key, owner.firstName);
      owner.lastName = decrypt(key, owner.lastName);
      owner.userName = decrypt(key, owner.userName);
      owner.email = decrypt(key, owner.email);
      owner.contact = decrypt(key, owner.contact);
      owner.gender = decrypt(key, owner.gender);
      owner.permanentAddress = decrypt(key, owner.permanentAddress);
      owner.correspondenceAddress = decrypt(key, owner.correspondenceAddress);
      owner.picture = decrypt(key, owner.picture);
      // owner.picture = owner.picture.replace('../../', '');
      // owner.picture = owner.picture.replace('../', '');
      if (owner.bankName) {
        owner.bankName = decrypt(key, owner.bankName);
      }
      if (owner.accountHolderName) {

        owner.accountHolderName = decrypt(key, owner.accountHolderName);
      }
      if (owner.accountNumber) {
        owner.accountNumber = decrypt(key, owner.accountNumber);
      }
      if (owner.panCardNumber) {
        owner.panCardNumber = decrypt(key, owner.panCardNumber);
      }
      if (owner.IFSCCode) {
        owner.IFSCCode = decrypt(key, owner.IFSCCode);
      }
      owner.adhaarCardNo = decrypt(key, owner.adhaarCardNo);
      owner.owner_members_detail_masters.forEach(x => {
        x.memberName = decrypt(key, x.memberName);
        x.gender = decrypt(key, x.gender);
      });
      owner.society_master.societyName = decrypt1(key, owner.society_master.societyName);
      owner.society_master.societyAddress = decrypt1(key, owner.society_master.societyAddress);
      owner.society_master.contactNumber = decrypt1(key, owner.society_master.contactNumber);
      owner.society_master.registrationNumber = decrypt1(key, owner.society_master.registrationNumber);
      owner.society_master.totalBoardMembers = decrypt1(key, owner.society_master.totalBoardMembers);
      owner.society_master.bankName = decrypt1(key, owner.society_master.bankName);
      owner.society_master.accountHolderName = decrypt1(key, owner.society_master.accountHolderName);
      owner.society_master.accountNumber = decrypt1(key, owner.society_master.accountNumber);
      owner.society_master.email = decrypt1(key, owner.society_master.email);
      owner.society_master.IFSCCode = decrypt1(key, owner.society_master.IFSCCode);
      getOwners.push(owner);
    });
    // console.log(getOwners);
    if (owners) {
      return res.status(httpStatus.CREATED).json({
        message: "Owner Content Page",
        getOwners
      });
    }
  } catch (error) {
    console.log("error==>", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
};




exports.get2 = async (req, res, next) => {
  let getOwners = [];
  try {
    const owners = await Owner.findAll({
      where: {
        isActive: true
      },
      order: [
        ["createdAt", "DESC"]
      ],

      include: [{
          model: OwnerMembersDetail
        },
        {
          model: FlatDetail,

        },
        {
          model: Society
        },
        {
          model: Tower
        }
      ]
    });

    // console.log(owners);

    owners.map(owner => {
      owner.firstName = decrypt(key, owner.firstName);
      owner.lastName = decrypt(key, owner.lastName);
      owner.userName = decrypt(key, owner.userName);
      owner.email = decrypt(key, owner.email);
      owner.contact = decrypt(key, owner.contact);
      owner.gender = decrypt(key, owner.gender);
      owner.permanentAddress = decrypt(key, owner.permanentAddress);
      owner.correspondenceAddress = decrypt(key, owner.correspondenceAddress);
      if (owner.picture !== null) {
        owner.picture = decrypt(key, owner.picture);

      }
      // owner.picture = owner.picture.replace('../', '');
      // owner.picture = owner.picture.replace('../', '');
      owner.adhaarCardNo = decrypt(key, owner.adhaarCardNo);
      owner.owner_members_detail_masters.forEach(x => {
        x.memberName = decrypt(key, x.memberName);
        x.gender = decrypt(key, x.gender);
      });
      owner.society_master.societyName = decrypt1(key, owner.society_master.societyName);
      owner.society_master.societyAddress = decrypt1(key, owner.society_master.societyAddress);
      owner.society_master.contactNumber = decrypt1(key, owner.society_master.contactNumber);
      owner.society_master.registrationNumber = decrypt1(key, owner.society_master.registrationNumber);
      owner.society_master.totalBoardMembers = decrypt1(key, owner.society_master.totalBoardMembers);
      owner.society_master.bankName = decrypt1(key, owner.society_master.bankName);
      owner.society_master.accountHolderName = decrypt1(key, owner.society_master.accountHolderName);
      owner.society_master.accountNumber = decrypt1(key, owner.society_master.accountNumber);
      owner.society_master.email = decrypt1(key, owner.society_master.email);
      owner.society_master.IFSCCode = decrypt1(key, owner.society_master.IFSCCode);
      getOwners.push(owner);
    });
    // console.log(getOwners);
    if (owners) {
      return res.status(httpStatus.CREATED).json({
        message: "Owner Content Page",
        getOwners
      });
    }
  } catch (error) {
    console.log("error==>", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
};



exports.getFlatNo = async (req, res, next) => {
  try {
    console.log("req.param id==>", req.params.id);
    const owner = await FlatDetail.findAll({
      // where: { towerId: req.params.id },
      where: {
        [Op.and]: [{
          towerId: req.params.id
        }, {
          isActive: true
        }]
      },
      order: [
        ["createdAt", "DESC"]
      ],
      include: [{
          model: Tower
        }
        //     // {model:FlatDetail}
        //     // include: [
        //     //     { model: Tower }
        //     // ]
      ]
    });
    if (owner) {
      return res.status(httpStatus.CREATED).json({
        message: " Flat Content Page",
        owner
      });
    }
  } catch (error) {
    console.log("error==>", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
};

exports.getFlatDetail = async (req, res, next) => {
  try {
    console.log("req.param id==>", req.params.id);
    const owner = await Owner.findAll({
      where: {
        flatDetailId: req.params.id
      },
      order: [
        ["createdAt", "DESC"]
      ],
      include: [{
          model: Tower,
          attributes: ["towerId", "towerName"]
        },
        {
          model: Society,
          attributes: ["societyId", "societyName"]
        },
        {
          model: User,
          attributes: ["userId", "userName"]
        }

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
    console.log("error==>", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
};

let deletePhoto = async function (owner) {
  let x = decrypt(key, owner.picture);
  console.log(x);
  x = x.replace('../', '');
  x = x.replace('../', '');
  let y = await fs.unlink(x);
};

exports.update1 = async (req, res, next) => {
  if (req.body.email !== undefined && req.body.contact !== null) {
    let existingOwner = await Owner.find({
      where: {
        [Op.and]: [{
          isActive: true
        }, {
          email: encrypt(key, req.body.email)
        }, {
          ownerId: {
            [Op.ne]: req.params.id
          }
        }]
      }
    });
    if (existingOwner) {
      return res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .json({
          message: "email already exist"
        });
    }
  }

  if (req.body.contact !== undefined && req.body.contact !== null) {
    let existingOwner1 = await Owner.find({
      where: {
        isActive: true,
        [Op.and]: [{
          contact: encrypt(key, req.body.contact)
        }, {
          ownerId: {
            [Op.ne]: req.params.id
          }
        }]
      }
    });
    if (existingOwner1) {
      return res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .json({
          message: "contact already exist"
        });
    }
  }
  let updAttr = {};
  let attrArr = [
    "firstName",
    "lastName",
    "email",
    "contact",
    "gender",
    "bankName",
    "accountHolderName",
    "accountNumber",
    "panCardNumber",
    "IFSCCode",
    "permanentAddress",
    "correspondenceAddress",
    "currentAddress",
    "contact",
    "adhaarCardNo"
  ];

  let userAttrs = [
    "firstName",
    "lastName",
    "email",
    "contact"
  ]
  let ids = ["flatDetailId", "societyId", "towerId", "floorId"];
  let others = ["dob", "noOfMembers"];
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .json({
          message: "Id is missing"
        });
    }
    const update = req.body;
    // const empty = isEmpty(update)
    // console.log(empty)

    if (!update) {
      return res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .json({
          message: "Please try again "
        });
    }
    const updatedOwner = await Owner.find({
      where: {
        ownerId: id,
        isActive: true
      }
    });
    attrArr.forEach(attr => {
      if (
        attr in req.body &&
        req.body[attr] !== undefined &&
        req.body[attr] !== null
      ) {
        updAttr[attr] = encrypt(key, req.body[attr]);
      }
    });
    others.forEach(attr => {
      if (
        attr in req.body &&
        req.body[attr] !== undefined &&
        req.body[attr] !== null
      ) {
        updAttr[attr] = req.body[attr];
      }
    });
    ids.forEach(attr => {
      if (
        attr in req.body &&
        req.body[attr] !== undefined &&
        req.body[attr] !== null
      ) {
        updAttr[attr] = req.body[attr];
      }
    });
    if (
      req.body.profilePicture !== undefined &&
      req.body.profilePicture !== null &&
      req.body.fileName !== undefined &&
      req.body.fileName !== null
    ) {
      let fileName = req.body.fileName.split(".")[0];
      let fileExt = req.body.fileName.split(".")[1];
      // deletePhoto(updatedOwner);
      saveToDisc(
        fileName,
        fileExt,
        req.body.profilePicture,
        async (err, resp) => {
          if (err) {
            console.log(err);
          }
          console.log(resp);
          // }
          const updatedImage = {
            picture: encrypt(key, resp)
          };
          await Owner.update(updatedImage, {
            where: {
              ownerId: id
            }
          });
        }
      );
    }
    console.log("updated attributes,", updAttr);
    let updatedOwner1 = await updatedOwner.updateAttributes(updAttr);

    if (updatedOwner1) {
      // updatedOwner1.userName = decrypt(key, updatedOwner1.userName);
      updatedOwner1.firstName = decrypt(key, updatedOwner1.firstName);
      updatedOwner1.lastName = decrypt(key, updatedOwner1.lastName);
      updatedOwner1.picture = decrypt(key, updatedOwner1.picture);
      updatedOwner1.email = decrypt(key, updatedOwner1.email);
      updatedOwner1.permanentAddress = decrypt(
        key,
        updatedOwner1.permanentAddress
      );
      updatedOwner1.correspondenceAddress = decrypt(
        key,
        updatedOwner1.correspondenceAddress
      );
      updatedOwner1.contact = decrypt(key, updatedOwner1.contact);
      updatedOwner1.gender = decrypt(key, updatedOwner1.gender);

      if (req.body.memberId !== undefined && req.body.memberId !== null) {
        await OwnerMembersDetail.find({
          where: {
            ownerId: id,
            memberId: req.body.memberId
          }
        });
        OwnerMembersDetail.updateAttributes({});
      }
      return res.status(httpStatus.OK).json({
        message: "Owner Updated Page",
        owner: updatedOwner1
      });
    }
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
};


exports.update2 = async (req, res, next) => {
  console.log(req.body);
  if (req.body.email !== undefined && req.body.contact !== null) {
    let existingOwner = await Owner.find({
      where: {
        isActive: true,
        [Op.and]: [{
          email: encrypt(key, req.body.email)
        }, {
          ownerId: {
            [Op.ne]: req.params.id
          }
        }]
      }
    });
    if (existingOwner) {
      return res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .json({
          message: "email already exist"
        });
    }
  }

  if (req.body.contact !== undefined && req.body.contact !== null) {
    let existingOwner1 = await Owner.find({
      where: {
        isActive: true,
        [Op.and]: [{
          contact: encrypt(key, req.body.contact)
        }, {
          ownerId: {
            [Op.ne]: req.params.id
          }
        }]
      }
    });
    if (existingOwner1) {
      return res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .json({
          message: "contact already exist"
        });
    }
  }
  let updAttr = {};
  let attrArr = [
    "firstName",
    "lastName",
    "email",
    "contact",
    "gender",
    "permanentAddress",
    "correspondenceAddress",
    "adhaarCardNo",
    "currentAddress",
    "contact",
    "adhaarCardNo"
  ];

  let userAttrs = [
    "firstName",
    "lastName",
    "email",
    "contact"
  ];

  let updUserAttr = {};
  let ids = ["flatDetailId", "societyId", "towerId", "floorId"];
  let others = ["dob", "noOfMembers"];
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .json({
          message: "Id is missing"
        });
    }
    const update = req.body;
    // const empty = isEmpty(update)
    // console.log(empty)

    if (!update) {
      return res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .json({
          message: "Please try again "
        });
    }
    const updatedOwner = await Owner.find({
      where: {
        ownerId: id,
        isActive: true
      }
    });
    const user = await User.findOne({
      where: {
        email: updatedOwner.email,
        isActive: true
      }
    })
    attrArr.forEach(attr => {
      if (
        attr in req.body &&
        req.body[attr] !== undefined &&
        req.body[attr] !== null &&
        req.body[attr] !== ""
      ) {
        updAttr[attr] = encrypt(key, req.body[attr]);
      }
    });
    userAttrs.forEach(attr => {
      if (
        attr in req.body &&
        req.body[attr] !== undefined &&
        req.body[attr] !== null &&
        req.body[attr] !== ""
      ) {
        updUserAttr[attr] = encrypt(key, req.body[attr]);
      }
    })
    others.forEach(attr => {
      if (
        attr in req.body &&
        req.body[attr] !== undefined &&
        req.body[attr] !== null &&
        req.body[attr] !== ""
      ) {
        updAttr[attr] = req.body[attr];
      }
    });
    ids.forEach(attr => {
      if (
        attr in req.body &&
        req.body[attr] !== undefined &&
        req.body[attr] !== null &&
        req.body[attr] !== ""
      ) {
        updAttr[attr] = req.body[attr];
      }
    });
    if (
      req.body.profilePicture !== undefined &&
      req.body.profilePicture !== null &&
      req.body.fileName !== undefined &&
      req.body.fileName !== null &&
      req.body.profilePicture !== ""
    ) {
      req.body.profilePicture = req.body.profilePicture.split(",")[1]
      let fileName = req.body.fileName.split(".")[0];
      let fileExt = req.body.fileName.split(".")[1];
      // deletePhoto(updatedOwner);
      saveToDisc(
        fileName,
        fileExt,
        req.body.profilePicture,
        async (err, resp) => {
          if (err) {
            console.log(err);
          }
          console.log(resp);
          // }
          const updatedImage = {
            picture: encrypt(key, resp)
          };
          await Owner.update(updatedImage, {
            where: {
              ownerId: id
            }
          });
        }
      );
    }
    console.log("updated attributes,", updAttr);
    let updatedOwner1 = await updatedOwner.updateAttributes(updAttr);
    let updatedUser = await user.updateAttributes(updUserAttr);

    if (updatedOwner1) {
      // updatedOwner1.userName = decrypt(key, updatedOwner1.userName);
      updatedOwner1.firstName = decrypt(key, updatedOwner1.firstName);
      updatedOwner1.lastName = decrypt(key, updatedOwner1.lastName);
      updatedOwner1.picture = decrypt(key, updatedOwner1.picture);
      updatedOwner1.email = decrypt(key, updatedOwner1.email);
      updatedOwner1.permanentAddress = decrypt(
        key,
        updatedOwner1.permanentAddress
      );
      updatedOwner1.correspondenceAddress = decrypt(
        key,
        updatedOwner1.correspondenceAddress
      );
      updatedOwner1.contact = decrypt(key, updatedOwner1.contact);
      updatedOwner1.gender = decrypt(key, updatedOwner1.gender);

      if (req.body.memberId !== undefined && req.body.memberId !== null) {
        await OwnerMembersDetail.find({
          where: {
            ownerId: id,
            memberId: req.body.memberId
          }
        });
        OwnerMembersDetail.updateAttributes({});
        // if(req.body.serviceId){
        //     vendorService.updateAttributes({
        //         serviceId:req.body.serviceId
        //     });
        // }
      }
      return res.status(httpStatus.OK).json({
        message: "Owner Updated Page",
        owner: updatedOwner1
      });
    }
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
};


exports.delete = async (req, res, next) => {
  try {
    console.log("deleting");
    const id = req.params.id;
    if (!id) {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
        message: "Id is missing"
      });
    }
    const update = req.body;
    if (!update) {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
        message: "Please try again "
      });
    }
    const updatedOwner = await Owner.find({
      where: {
        ownerId: id,
        isActive: true
      }
    });
    if (updatedOwner) {
      updatedOwner.updateAttributes(update);

    }
    const updatedUser = await User.findOne({
      where: {
        email: updatedOwner.email
      }
    });
    console.log("show yourself", updatedUser);
    if (updatedUser) {
      updatedUser.updateAttributes({
        isActive: false
      });
      let updatedUserRoles = await UserRoles.find({
        where: {
          userId: updatedUser.userId
        }
      }).then(userRole => {
        userRole.updateAttributes(update);
      })
    }


    const flatDetails = await OwnerFlatDetail.findAll({
      where: {
        ownerId: id,
        isActive: true
      }
    }).then(entries => {
      return entries.forEach(async function (entry) {
        // Deactivate Tenant Here
        let tenants = await TenantFlatDetail.findAll({
          where: {
            isActive: true,
            flatDetailId: entry.flatDetailId
          }
        });
        if (tenants) {
          // tenants.forEach(tenant => tenant.updateAttributes(update))
          tenants.forEach(tenant => tenant.destroy())
        }
        return entry.updateAttributes(update);
      })
    });

    console.log("flats", flatDetails);

    // const updatedVendorService = await VendorService.find({ where: { vendorId: id } }).then(vendorService => {
    //     return vendorService.updateAttributes(update)
    // })
    const updatedOwnerMembersDetail = await OwnerMembersDetail.update(update, {
      where: {
        ownerId: id
      }
    })
    if (updatedOwner && updatedOwnerMembersDetail) {
      return res.status(httpStatus.OK).json({
        message: "Owner deleted successfully",
      });
    }
  } catch (error) {
    console.log("error::", error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
}

exports.deleteSelected = async (req, res, next) => {
  try {
    let userEmails = [];
    const deleteSelected = req.body.ids;
    console.log("delete selected==>", deleteSelected);

    const update = {
      isActive: false
    };
    if (!deleteSelected) {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
        message: "No id Found"
      });
    }
    const updatedOwners = await Owner.update(update, {
      where: {
        ownerId: {
          [Op.in]: deleteSelected
        }
      }
    });
    let usersToUpdate = await Owner.findAll({
      where: {
        ownerId: {
          [Op.in]: deleteSelected
        }
      }
    });
    // const updatedUsers = await User.findAll()
    if (usersToUpdate.length > 0) {
      usersToUpdate.forEach(async (updatedOwner) => {
        console.log("updatedOwnerEmail", updatedOwner.email)
        let user = await User.findOne({
          where: {
            isActive: true,
            email: updatedOwner.email
          }
        })
        let role = await UserRoles.findOne({
          where: {
            userId: user.userId
          }
        });
        role.updateAttributes(update);
        return user.updateAttributes(update);
      });
    }

    // const updatedUsers = updatedOwners.forEach(async (owner) => {
    //   await User.update(update,{where:{email:owner.email}})
    // })

    const updatedOwnersMembers = await OwnerMembersDetail.update(update, {
      where: {
        ownerId: {
          [Op.in]: deleteSelected
        }
      }
    });

    let flatDetails = await OwnerFlatDetail.update(update, {
      where: {
        isActive: true,
        ownerId: {
          [Op.in]: deleteSelected
        }
      }
    });

    let flats = await OwnerFlatDetail.findAll({
      where: {
        isActive: true,
        ownerId: {
          [Op.in]: deleteSelected
        }
      }
    });
    if(flats.length > 0){
      flats.forEach(async flat => {
        let tenants = await TenantFlatDetail.findAll({where:{isActive:true,flatDetailId:flat.flatDetailId}});
        if(tenants){
          tenants.forEach(tenant => {
            // tenant.updateAttributes({isActive:false});
            tenant.destroy();
          })
        }
      })
    }

    if (updatedOwners && updatedOwnersMembers && flatDetails) {
      return res.status(httpStatus.OK).json({
        message: "Owners deleted successfully",
      });
    };
  } catch (error) {
    console.log(error)
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
}

exports.getMembers = async (req, res, next) => {
  try {
    let memberArr = [];

    let ownerId = req.params.id;

    let ownerMembers = await OwnerMembersDetail.findAll({
      where: {
        [Op.and]: [{
          ownerId: ownerId
        }, {
          isActive: true
        }, ]
      },
      include: [{
        model: Relation,
        attributes: ["relationId", "relationName"]
      }]
    });

    ownerMembers.map(ownerMember => {
      ownerMember.memberName = decrypt(key, ownerMember.memberName);
      ownerMember.gender = decrypt(key, ownerMember.gender);
      memberArr.push(ownerMember);
    })

    return res.status(httpStatus.OK).json({
      message: "OwnerMembers fetched successfully",
      memberArr
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
}

exports.deleteMember = async (req, res, next) => {
  let ownerMemberId = req.params.id;
  //let ownerId = req.params.ownerId;
  if (!ownerMemberId) {
    return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
      message: "Id is missing"
    });
  }
  let update = {
    isActive: false
  };

  const updatedOwnerMembersDetail = await OwnerMembersDetail.update(update, {
    where: {
      [Op.and]: [{
        memberId: ownerMemberId
      }, {
        isActive: true
      }]
    }
  });
  if (updatedOwnerMembersDetail) {
    return res.status(httpStatus.OK).json({
      message: "OwnerMember deleted successfully",
    });
  }
}

exports.deleteSelectedMembers = async (req, res, next) => {
  try {
    const deleteSelected = req.body.ids;
    console.log("delete selected==>", deleteSelected);

    const update = {
      isActive: false
    };
    if (!deleteSelected) {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
        message: "No id Found"
      });
    }
    // const updatedOwners = await Owner.update(update, { where: { ownerId: { [Op.in]: deleteSelected } } })

    const updatedOwnersMembers = await OwnerMembersDetail.update(update, {
      where: {
        memberId: {
          [Op.in]: deleteSelected
        }
      }
    });
    if (updatedOwnersMembers) {
      return res.status(httpStatus.OK).json({
        message: "Owners deleted successfully",
      });
    };
  } catch (error) {
    console.log(error)
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
};


exports.updateMember = async (req, res, next) => {
  try {
    console.log("updatememberreq====>", req.body);
    let updAttr = {};
    let attrArr = [
      "memberName",
      "gender"
    ];
    let ids = ["relationId"];
    let others = ["memberDob"];

    console.log("updating ownerMember");
    console.log(":::::req.body==>", req.body);
    const id = req.params.id;
    console.log(":::::id", id);
    if (!id) {
      return res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .json({
          message: "Id is missing"
        });
    }
    const update = req.body;

    if (!update) {
      return res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .json({
          message: "Please try again "
        });
    }
    const updatedOwnerMember = await OwnerMembersDetail.find({
      where: {
        memberId: id
      }
    });
    attrArr.forEach(attr => {
      if (
        attr in req.body &&
        req.body[attr] !== undefined &&
        req.body[attr] !== null
      ) {
        updAttr[attr] = encrypt(key, req.body[attr]);
      }
    });
    others.forEach(attr => {
      if (
        attr in req.body &&
        req.body[attr] !== undefined &&
        req.body[attr] !== null
      ) {
        updAttr[attr] = req.body[attr];
      }
    });
    ids.forEach(attr => {
      if (
        attr in req.body &&
        req.body[attr] !== undefined &&
        req.body[attr] !== null
      ) {
        updAttr[attr] = req.body[attr];
      }
    });

    let updatedOwner1 = await updatedOwnerMember.updateAttributes(updAttr);

    return res.status(httpStatus.OK).json({
      message: "Owner Updated Page",
      owner: updatedOwner1
    });

  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
};


exports.addMember = (req, res, next) => {
  try {
    console.log("gsdfhgsdahjfgjhadsf", req.body);
    let ownerId = req.params.id;
    req.body.ownerId = req.params.id;
    req.body.memberName = encrypt(key, req.body.memberName);
    req.body.gender = encrypt(key, req.body.gender);
    let fields = req.body;
    fields.userId = req.userId;

    console.log(fields);

    OwnerMembersDetail.create(fields).then(newOwner => res.status(httpStatus.OK).json({
      message: "OwnerMember created successfully",
      owner: newOwner
    }))
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
}

exports.addMoreFlats = async (req, res, next) => {
  try {
    console.log("api is running");
    let ownerId = req.body.ownerId;
    let flatDetailId = req.body.flatDetailId;
    if (ownerId === undefined || flatDetailId === undefined) {
      return res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .json({
          message: "Id is missing"
        });
    }
    let check = await OwnerFlatDetail.findOne({
      where: {
        isActive: false,
        ownerId: ownerId,
        flatDetailId: flatDetailId
      }
    });
    if (check) {
      check.updateAttributes({
        isActive: true
      });
      res.status(httpStatus.OK).json({
        message: "Flat Added Sucessfully to respective Owner",
        result: check
      })
    } else {
      let result = await OwnerFlatDetail.create({
        flatDetailId: flatDetailId,
        ownerId: ownerId
      });
      if (result) {
        res.status(httpStatus.OK).json({
          message: "Flat Added Sucessfully to respective Owner",
          result: result
        })
      }
    }

  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
}

exports.getflats = async (req, res, next) => {
  try {
    let parkingAndSlotArr = [];
    let flatDetailIds = [];
    console.log("hello get,", req.params.id);
    let ownerId = req.params.id;
    let flat = await Owner.findOne({
      where: {
        isActive: true,
        ownerId: ownerId,
      },
      include: [{
        model: FlatDetail,
        through: {
          where: {
            isActive: true
          }
        },
        include: [{
          model: Flat
        }, {
          model: Tower
        }, {
          model: Floor
        }]
      }]

    });
    if (flat) {
      console.log("asdf");
      flat.flat_detail_masters.forEach(element => {
        flatDetailIds.push(element.flatDetailId);
      });
      let parkAndSlot = await FlatParkingDetails.findAll({
        where: {
          isActive: true,
          flatDetailId: {
            [Op.in]: flatDetailIds
          }
        },
        include: [{
          model: FlatDetail,
          include: [{
            model: Flat
          }, {
            model: Floor
          }, {
            model: Tower
          }]
        }, {
          model: Parking
        }, {
          model: Slot
        }]
      });
      console.log("flatParking", flat.parkAndSlot);
      res.status(httpStatus.OK).json({
        message: "owner's flats",
        flats: flat

      })
    }
  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }

}


exports.deleteFlat = async (req, res, next) => {
  try {
    console.log("deleteflat is running", req.params.id, req.body.flatDetailId);
    let ownerId = req.params.id;
    let flatDetailId = req.body.flatDetailId;
    if (ownerId === undefined || flatDetailId === undefined) {
      return res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .json({
          message: "Id is missing"
        });
    };
    let result = await OwnerFlatDetail.update({
      isActive: false
    }, {
      where: {
        flatDetailId: flatDetailId,
        ownerId: ownerId
      }

    });
    let tenants = await TenantFlatDetail.findAll({where:{isActive:true,flatDetailId:flatDetailId}});
    if(tenants){
      tenants.forEach(tenant => tenant.destroy())
    }
    if (result) {
      res.status(httpStatus.OK).json({
        message: "Flat deleted Successfully",
        result: result
      })
    }

  } catch (error) {
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }

}


exports.editFlat = async (req,res,next) => {
  try{
    console.log("editing flat");
    let ownerId = req.params.id;
    let previousFlatId = req.body.previousId;
    let newFlatId = req.body.newId;
    console.log("going",ownerId,previousFlatId,newFlatId);
    let check = await OwnerFlatDetail.findOne({where:{isActive:true,ownerId:ownerId,flatDetailId:newFlatId}});
    if(check) {
      console.log("check",check)
      res.status(httpStatus.OK).json({
        message: "Flat already registered to the given owner",
        result: check
      })
    }
    let deleteFlat = await OwnerFlatDetail.findOne({where:{isActive:true,flatDetailId:previousFlatId,ownerId:ownerId}});
    if(deleteFlat){
      deleteFlat.updateAttributes({isActive:false});
      let tenants = await TenantFlatDetail.findAll({where:{isActive:true,flatDetailId:previousFlatId}});
      
      tenants.forEach(tenant => tenant.destroy());
      
      let checkprev = await OwnerFlatDetail.findOne({where:{isActive:false,ownerId:ownerId,flatDetailId:newFlatId}});
      if(checkprev){
        checkprev.updateAttributes({isActive:true});
        res.status(httpStatus.OK).json({
          message: "Flat edit successfully"
        })
      }else{
        let newFlat = await OwnerFlatDetail.create({
          ownerId:ownerId,
          flatDetailId:newFlatId
        });
        if(newFlat){
          res.status(httpStatus.OK).json({
            message: "Flat edit successfully",
            result: newFlat
          })
        }
      }   
      
    }
  }catch(error){
    console.log(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
  
}