const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');

const SocietyMember = db.societyMember;
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
        const societyMember = await SocietyMember.create(body);
        return res.status(httpStatus.CREATED).json({
            message: "Society member registered successfully",
            societyMember
        });
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const societyMember = await SocietyMember.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']],
            include: [
               {model:Designation,attributes:['designationId','designationName']},
               {model:Country,attributes:['countryId','countryName']},
               {model:City,attributes:['cityId','cityName']},
               {model:State,attributes:['stateId','stateName']},
               {model:Location,attributes:['locationId','locationName']},
               {model:Society,attributes:['societyId','societyName']},
            ]
        });
        if (societyMember) {
            return res.status(httpStatus.CREATED).json({
                message: "Society Member Content Page",
                societyMember: societyMember
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
        // console.log("update==>", update)
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const societyMember = await SocietyMember.find({ where: { societyMemberId: id } }).then(societyMember => {

        })
        if (societyMember) {
            return res.status(httpStatus.OK).json({
                message: "Society Member Updated Page",
                societyMember: societyMember
            });
        }
    } catch (error) {
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
        const societyMember = await SocietyMember.find({ where: { societyMemberId: id } }).then(societyMember => {
            return societyMember.updateAttributes(update)
        })
        if (societyMember) {
            return res.status(httpStatus.OK).json({
                message: "Society Member deleted successfully",
                societyMember: societyMember
            });
        }
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}