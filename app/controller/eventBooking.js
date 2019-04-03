const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');
const shortId = require("short-id");
const path = require("path");
const fs = require("fs");
const http = require('http');
const crypto = require("crypto");
const key = config.secret;

const Event = db.event;
const User = db.user;
const Role = db.role;
const Op = db.Sequelize.Op;
const SocietyEventBook = db.eventBooking;



function decrypt1(key, data) {
  var decipher = crypto.createDecipher("aes-128-cbc", key);
  var decrypted = decipher.update(data, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
}


let deleteFile = async (photo) => {
  let x = decrypt(key, photo);
  await fs.unlink(x, (err) => {
    if (err) {
      console.log("file to delete is missing")
    }
  });
};


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
    console.log("user is =====>", req.userId);
    const eventExists = await SocietyEventBook.findAll({ where: { isActive: true, eventId: req.body.eventId, startDate: req.body.startDate } });
    // console.log(eventExists.length + "length")
    if (eventExists.length > 0) {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: 'Event has been already registered.Please try again with different time or date' })
    }

    let createAttr = {};
    let fieldsArr = [
      "eventId",
      "startDate",
      "startTime",
      "endTime",
      "endDate",
      "breakfast",
      "lunch",
      "eveningSnacks",
      "dinner",
      "drinks",
      "dj",
      "perPersonCharge",
      "childAbove",
      "charges",
      "description",

    ];
    let fileArr = ["invitationCardPicture"];

    fieldsArr.forEach(attr => {
      if (
        attr in req.body &&
        req.body[attr] !== undefined &&
        req.body[attr] !== null
      ) {
        createAttr[attr] = req.body[attr];
      }
    });
    createAttr["eventOrganiser"] = req.body.organisedBy;
    let eventBook = await SocietyEventBook.create(createAttr);
    eventBookId = eventBook.societyEventBookId;
    if (req.body.invitationCardPicture) {
      req.body.invitationCardPicture = req.body.invitationCardPicture.split(",")[1]
      let fileName = req.body.fileName.split(".")[0];
      let fileExt = req.body.fileName.split(".")[1];
      saveToDisc(
        fileName,
        fileExt,
        req.body.invitationCardPicture,
        (err, resp) => {
          if (err) {
            console.log(err);
          }
          console.log(resp);
          // }
          const updatedImage = {
            invitationCardPicture: resp
          };
          SocietyEventBook.update(updatedImage, { where: { societyEventBookId: eventBookId } });
        }
      );
    }
    return res.status(httpStatus.CREATED).json({
      message: "event  successfully booked "
    });
  }
  catch (error) {
    console.log("error==>", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
}

exports.get = async (req, res, next) => {
  try {
    const eventBookings = await SocietyEventBook.findAll({
      where: { isActive: true },
      order: [["createdAt", "DESC"]],
      include: [{
        model: Event
      }, { model: User }]
    });
    if (eventBookings) {
      eventBookings.map(eventBooking => {
        eventBooking.user_master.firstName = decrypt1(key, eventBooking.user_master.firstName);
        eventBooking.user_master.lastName = decrypt1(key, eventBooking.user_master.lastName);
      })
      return res.status(httpStatus.CREATED).json({
        message: "eventBooking Content Page",
        eventBookings
      });
    }
  } catch (error) {
    console.log("error==>", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    console.log("req----------->", req.body);
    const eventExists = await SocietyEventBook.findOne({ where: { isActive: true, eventId: req.body.eventId, startDate: req.body.startDate,societyEventBookId:{[Op.ne]:req.params.id } }});
    if (eventExists) {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: 'Event has been already registered.Please try again with different time or date' })
    }

    let updateAttr = {};
    let fieldsArr = [
      "eventId",
      "startDate",
      "startTime",
      "endTime",
      "endDate",
      "breakfast",
      "lunch",
      "eveningSnacks",
      "dinner",
      "drinks",
      "dj",
      "perPersonCharge",
      "childAbove",
      "charges",
      "description",

    ];
    fieldsArr.forEach(attr => {
      if (
        attr in req.body &&
        req.body[attr] !== undefined &&
        req.body[attr] !== null
      ) {
        updateAttr[attr] = req.body[attr];
      }
    });
    if (req.body.organisedBy) {
      updateAttr["eventOrganiser"] = req.body.organisedBy;
    }
    let updatedEvent = await SocietyEventBook.update(updateAttr, { where: { societyEventBookId: req.params.id } })
    console.log("atin");
    //   if(req.files.invitationCardPicture){
    //     let photoToDelete = updatedEvent.invitationCardPicture;
    //     updateAttr.invitationCardPicture = req.files.invitationCardPicture[0].path
    //     deleteFile(photoToDelete);        
    // }
    console.log("asd------>", updatedEvent);
    return res.status(httpStatus.OK).json({
      message: "updated successfully"
    });

  }
  catch (error) {
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
    const update = { isActive: false };
    if (!update) {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
    }
    const updatedEventBooking = await SocietyEventBook.find({ where: { societyEventBookId: id } }).then(event => {
      return event.updateAttributes(update)
    })

    if (updatedEventBooking) {
      return res.status(httpStatus.OK).json({
        message: "event booking deleted successfully",
      });
    }
  } catch (error) {
    console.log("error::", error);
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
    const updatedEventBookings = await SocietyEventBook.update(update, { where: { societyEventBookId: { [Op.in]: deleteSelected } } })


    if (updatedEventBookings) {
      return res.status(httpStatus.OK).json({
        message: "Event Bookings deleted successfully",
      });
    };
  } catch (error) {
    console.log(error)
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
}



