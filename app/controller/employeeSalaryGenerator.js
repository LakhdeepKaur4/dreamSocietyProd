const db = require('../config/db.config.js');
const httpStatus = require('http-status');
const encryption = require('../handlers/encryption');

const EmployeeSalary = db.employeeSalaryAccount;
const Account = db.account;
const Employee = db.employee;
const EmployeeDetail = db.employeeDetail;
const EmployeeWorkType = db.employeeWorkType;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    try {
        let body = req.body;
        body.userId = req.userId;
        const employeeSalary = await EmployeeSalary.create(body);
        return res.status(httpStatus.CREATED).json({
            message: "Employee salary generated successfully created",
            employeeSalary
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const salary = await EmployeeSalary.findAll({
            where: { isActive: true }, order: [
                ['createdAt', 'DESC']
            ],
            include: [{ model: Employee, include: [{ model: EmployeeDetail, include: [{ model: EmployeeWorkType, attributes: ['employeeWorkType'] }], attributes: ['serviceType'] }], attributes: ['firstName', 'middleName', 'employeeDetailId', 'lastName', 'basic', 'hra', 'travelAllowance', 'pf', 'esi', 'contact', 'email', 'currentAddress', 'permanentAddress', 'startDate'] }, { model: Account, attributes: ['bankName', 'accountNo', 'pan'] }]
        });
        salary.map(item => {
            item.employee_master.firstName = encryption.decrypt(item.employee_master.firstName)
            item.employee_master.middleName = item.employee_master.middleName ? encryption.decrypt(item.employee_master.middleName) : '';
            item.employee_master.lastName = encryption.decrypt(item.employee_master.lastName)
            item.employee_master.basic = encryption.decrypt(item.employee_master.basic)
            item.employee_master.hra = encryption.decrypt(item.employee_master.hra)
            item.employee_master.travelAllowance = encryption.decrypt(item.employee_master.travelAllowance)
            item.employee_master.pf = encryption.decrypt(item.employee_master.pf)
            item.employee_master.esi = encryption.decrypt(item.employee_master.esi)
            item.employee_master.contact = encryption.decrypt(item.employee_master.contact)
            item.employee_master.email = encryption.decrypt(item.employee_master.email)
            item.employee_master.currentAddress = encryption.decrypt(item.employee_master.currentAddress)
            item.employee_master.permanentAddress = encryption.decrypt(item.employee_master.permanentAddress)
            item.employee_master.startDate = encryption.decrypt(item.employee_master.startDate)
        })
        if (salary) {
            return res.status(httpStatus.OK).json({
                message: "Salary Generated Content Page",
                salary
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.update = async (req, res, next) => {
    console.log("***********")
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const id = req.params.id;
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;

        console.log("update", update)

        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updated = await EmployeeSalary.find({ where: { employeeSalaryId: id } }).then(salary => {
            return salary.updateAttributes({ isActive: false }, transaction)
        })

        const employeeSalary = await EmployeeSalary.create(update);
        await transaction.commit();
        if (updated && employeeSalary) {
            return res.status(httpStatus.OK).json({
                message: "Employee Salary Updated Page",
                // assets: employeeSalary
            });
        } else {
            return res.status(httpStatus.OK).json({
                message: "Something went wrong",
            });
        }
    } catch (error) {
        console.log("error==>", error);
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

