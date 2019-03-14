const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');

const Designation = db.designation;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    try {
        console.log("creating designation");
        let body = req.body;
        body.userId = req.userId;

        const designations = await Designation.findAll({
            where: {
                isActive: true
            }
        })
        let error = designations.some(designation => {
            return designation.designationName.toLowerCase().replace(/ /g, '') == req.body.designationName.toLowerCase().replace(/ /g, '');
        });
        if (error) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Designation Name already Exists" })
        }
        const designation = await Designation.create(body);
        if (designation) {
            return res.status(httpStatus.CREATED).json({
                message: "Designation successfully created",
                designation
            });
        }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const designation = await Designation.findAll({ where: { isActive: true }, order: [['createdAt', 'DESC']] });
        if (designation) {
            return res.status(httpStatus.CREATED).json({
                message: "Designation Content Page",
                designation: designation
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
        const designations = await Designation.findAll({
            where: {
                isActive: true
            }
        })
        let error = designations.some(designation => {
            return designation.designationName.toLowerCase().replace(/ /g, '') == req.body.designationName.toLowerCase().replace(/ /g, '');
        });
        if (error) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Designation Name already Exists" })
        }
        const update = req.body;
        console.log("update==>", update)
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedDesignation = await Designation.find({ where: { designationId: id } }).then(designation => {
            return designation.updateAttributes(update)
        })
        if (updatedDesignation) {
            return res.status(httpStatus.OK).json({
                message: "Designation Updated Page",
                updatedDesignation
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
        const updatedDesignation = await Designation.find({ where: { designationId: id } }).then(designation => {
            return designation.updateAttributes(update)
        })
        if (updatedDesignation) {
            return res.status(httpStatus.OK).json({
                message: "Designation deleted successfully",
                updatedDesignation
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
        const updatedDesignation = await Designation.update(update, { where: { designationId: { [Op.in]: deleteSelected } } })
        if (updatedDesignation) {
            return res.status(httpStatus.OK).json({
                message: "Designations deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}