const db = require('../config/db.config.js');
const httpStatus = require('http-status')

const EmployeeDetail = db.employeeDetail;
const EmployeeType = db.employeeType;
const EmployeeWorkType = db.employeeWorkType;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    try {
        let body = req.body;
        body.userId = req.userId;
        existingEmployeeDetail = await EmployeeDetail.findOne({ where: { [Op.and]: [{ serviceType: body.serviceType }, { employeeTypeId: body.employeeTypeId }, { employeeWorkTypeId: body.employeeWorkTypeId }, { isActive: true }] } });
        if (existingEmployeeDetail !== null) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                message: "Employee Detail already exist"
            });
        } else {
            const employeeDetail = await EmployeeDetail.create(body);
            return res.status(httpStatus.CREATED).json({
                message: "Employee Detail successfully created",
                employeeDetail
            });
        }
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const employeeDetail = await EmployeeDetail.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']],
            include: [
                { model: EmployeeType },
                { model: EmployeeWorkType }
            ]
        });
        if (employeeDetail) {
            return res.status(httpStatus.OK).json({
                message: "Employee Detail Content Page",
                employeeDetail
            });
        }
    } catch (error) {
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

        console.log("update", update)

        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        existingEmployeeDetail = await EmployeeDetail.findOne({ where: { [Op.and]: [{ serviceType: update.serviceType }, { employeeTypeId: update.employeeTypeId }, { employeeWorkTypeId: update.employeeWorkTypeId }, { isActive: true }, {employeeDetailId:{ [Op.ne]:  id } }] } });
        if (existingEmployeeDetail !== null) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                message: "Employee Detail already exist"
            });
        } else {
            const updatedEmployee = await EmployeeDetail.find({ where: { employeeDetailId: id } }).then(employee => {
                return employee.updateAttributes(update)
            })
            if (updatedEmployee) {
                return res.status(httpStatus.OK).json({
                    message: "Employee Updated Page",
                    updatedEmployee
                });
            }
        }
    } catch (error) {
        console.log("error==>", error)
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
        const updatedEmployee = await EmployeeDetail.find({ where: { employeeDetailId: id } }).then(employee => {
            return employee.updateAttributes(update)
        })
        if (updatedEmployee) {
            return res.status(httpStatus.OK).json({
                message: "Employee deleted successfully",
                updatedEmployee
            });
        }
    } catch (error) {
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
        const updatedEmployeeDetail = await EmployeeDetail.update(update, { where: { employeeDetailId: { [Op.in]: deleteSelected } } })
        if (updatedEmployeeDetail) {
            return res.status(httpStatus.OK).json({
                message: "EmployeeDetails deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}