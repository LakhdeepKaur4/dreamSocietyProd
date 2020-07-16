const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');

const EmployeeSalary = db.employeeSalary;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        console.log("creating employee salary details");
        let body = req.body;
        body.userId = req.userId;

        const employeeSalary = await EmployeeSalary.findAll({
            where: {
                isActive: true
            }
        })
        const employeeSal = await EmployeeSalary.create(body, transaction);
        await transaction.commit();
        if (employeeSal) {
            return res.status(httpStatus.CREATED).json({
                message: "Employee salary slip successfully created",
                employeeSal
            });
        }
    } catch (error) {
        console.log("error==>", error);
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const employeeSalary = await EmployeeSalary.findAll({ where: { isActive: true }, order: [['createdAt', 'DESC']] });
        if (employeeSalary) {
            return res.status(httpStatus.OK).json({
                message: "Employee Salary Content Page",
                employeeSalary: employeeSalary
            });
        }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

// exports.update = async (req, res, next) => {
//     let transaction;
//     try {
//         transaction = await db.sequelize.transaction();
//         const id = req.params.id;
//         const update = req.body;
//         if (!id) {
//             return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
//         }

//         const empSalary = await EmployeeSalary.findOne({
//             where: {
//                 [Op.and]: [
//                     { isActive: true },
//                     { designationId: id },
//                 ]
//             }
//         })

//         if (designation.designationName === update.designationName) {
//             const updatedDesignation = await Designation.find({ where: { designationId: id } }).then(designation => {
//                 return designation.updateAttributes(update, transaction);
//             })
//             await transaction.commit();
//             if (updatedDesignation) {
//                 return res.status(httpStatus.OK).json({
//                     message: "Designation Updated Page",
//                     updatedDesignation: updatedDesignation
//                 });
//             }
//         } else {
//             const designations = await Designation.findAll({
//                 where: {
//                     isActive: true
//                 }
//             })
//             let error = designations.some(designation => {
//                 return designation.designationName.toLowerCase().replace(/ /g, '') == req.body.designationName.toLowerCase().replace(/ /g, '');
//             });
//             if (error) {
//                 return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Designation Name already Exists" })
//             }

//             const updatedDesignation = await Designation.find({ where: { designationId: id } }).then(designation => {
//                 return designation.updateAttributes(update, transaction)
//             })
//             await transaction.commit();
//             if (updatedDesignation) {
//                 return res.status(httpStatus.OK).json({
//                     message: "Designation Updated Page",
//                     updatedDesignation
//                 });
//             }
//         }
//     } catch (error) {
//         if (transaction) await transaction.rollback();
//         res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
//     }
// }

// exports.delete = async (req, res, next) => {
//     let transaction;
//     try {
//         transaction = await db.sequelize.transaction();
//         const id = req.params.id;

//         if (!id) {
//             return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
//         }
//         const update = req.body;
//         if (!update) {
//             return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
//         }
//         const updatedDesignation = await Designation.find({ where: { designationId: id } }).then(designation => {
//             return designation.updateAttributes(update, transaction)
//         })
//         await transaction.commit();
//         if (updatedDesignation) {
//             return res.status(httpStatus.OK).json({
//                 message: "Designation deleted successfully",
//                 updatedDesignation
//             });
//         }
//     } catch (error) {
//         if (transaction) await transaction.rollback();
//         res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
//     }
// }


// exports.deleteSelected = async (req, res, next) => {
//     let transaction;
//     try {
//         transaction = await db.sequelize.transaction();
//         const deleteSelected = req.body.ids;
//         console.log("delete selected==>", deleteSelected);
//         const update = { isActive: false };
//         if (!deleteSelected) {
//             return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
//         }
//         const updatedDesignation = await Designation.update(update, { where: { designationId: { [Op.in]: deleteSelected } }, transaction });
//         await transaction.commit();
//         if (updatedDesignation) {
//             return res.status(httpStatus.OK).json({
//                 message: "Designations deleted successfully",
//             });
//         }
//     } catch (error) {
//         console.log(error);
//         if (transaction) await transaction.rollback();
//         return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
//     }
// }