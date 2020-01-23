const db = require('../config/db.config.js');
const httpStatus = require('http-status');
const encryption = require('../handlers/encryption');

const Account = db.account;
const Employee = db.employee;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        console.log("creating accounts");
        let body = req.body;
        body.userId = req.userId;
        const result = body.accounts.map(function (element) { element.employeeId = body.employeeId });
        const accounts = await Account.bulkCreate(body.accounts, { returning: true }, { transaction });
        await transaction.commit();
        if (accounts) {
            return res.status(httpStatus.CREATED).json({
                message: "Account Linked successfully",
                accounts
            });
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const accounts = await Account.findAll({
            where: { isActive: true }, order: [
                ['createdAt', 'DESC']
            ],
            include: [{ model: Employee, attributes: ['firstName', 'middleName', 'lastName'] }]
        });
        accounts.map(item => {
            item.employee_master.firstName = encryption.decrypt(item.employee_master.firstName)
            item.employee_master.middleName = item.employee_master.middleName ? encryption.decrypt(item.employee_master.middleName) : '';
            item.employee_master.lastName = encryption.decrypt(item.employee_master.lastName)
        })
        if (accounts) {
            return res.status(httpStatus.OK).json({
                message: "Accounts Content Page",
                accounts
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.getById = async (req, res, next) => {
    try {
        const employeeId = req.params.id;
        const accounts = await Account.findAll({
            where: { employeeId: employeeId }, order: [
                ['createdAt', 'DESC']
            ],
            include: [{ model: Employee, attributes: ['firstName', 'middleName', 'lastName'] }]
        });
        accounts.map(item => {
            item.employee_master.firstName = encryption.decrypt(item.employee_master.firstName)
            item.employee_master.middleName = item.employee_master.middleName ? encryption.decrypt(item.employee_master.middleName) : '';
            item.employee_master.lastName = encryption.decrypt(item.employee_master.lastName)
        })
        if (accounts) {
            return res.status(httpStatus.OK).json({
                message: "Accounts Content Page",
                accounts
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getActiveById = async (req, res, next) => {
    try {
        const employeeId = req.params.id;
        const account = await Account.find({
            where: { isActive: true, employeeId: employeeId }, order: [
                ['createdAt', 'DESC']
            ],
            // include: [{ model: Employee, attributes: ['firstName', 'middleName', 'lastName'] }]
        });
        // accounts.map(item => {
        // account.employee_master.firstName = encryption.decrypt(account.employee_master.firstName)
        // account.employee_master.middleName = account.employee_master.middleName ? encryption.decrypt(account.employee_master.middleName) : '';
        // account.employee_master.lastName = encryption.decrypt(account.employee_master.lastName)
        // })
        if (account) {
            return res.status(httpStatus.OK).json({
                message: "Account Content Page",
                account
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}



exports.update = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
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
        const updatedAccount = await Account.find({ where: { accountId: id } }).then(account => {
            return account.updateAttributes(update, transaction)
        })
        await transaction.commit();
        if (updatedAccount) {
            return res.status(httpStatus.OK).json({
                message: "Account Updated Successfully",
                assets: updatedAccount
            });
        }
    } catch (error) {
        console.log("error==>", error);
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.delete = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const id = req.params.id;
        console.log("in acconts delete ==>", id)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = { isActive: false };
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedAccount = await Account.find({ where: { accountId: id } }).then(account => {
            return account.updateAttributes(update, transaction)
        });
        await transaction.commit();
        if (updatedAccount) {
            return res.status(httpStatus.OK).json({
                message: "Account deleted successfully",
                assets: updatedAccount
            });
        }
    } catch (error) {
        console.log(error, "....")
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.deleteSelected = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const deleteSelected = req.body.ids;
        console.log("delete selected==>", deleteSelected);
        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const updatedAccounts = await Account.update(update, { where: { accountId: { [Op.in]: deleteSelected } }, transaction });
        await transaction.commit();
        if (updatedAccounts) {
            return res.status(httpStatus.OK).json({
                message: "Accounts deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.activateAccount = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const empId = req.params.empId;
        const id = req.params.id;
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = { isActive: true };

        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const ifActivatedAccountExists = await Account.find({
            where: {
                employeeId: empId,
                isActive: true
            }
        });
        if (ifActivatedAccountExists) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                message: "Only one account can be activated.Please deactivate first then try again.",
            });
        } else {
            const updatedAccount = await Account.find({ where: { accountId: id } }).then(account => {
                return account.updateAttributes(update, transaction)
            })
            await transaction.commit();
            if (updatedAccount) {
                return res.status(httpStatus.OK).json({
                    message: "Account Updated Successfully",
                    assets: updatedAccount
                });
            }
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}