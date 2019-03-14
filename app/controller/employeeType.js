const db = require('../config/db.config.js');
const httpStatus = require('http-status')

const EmployeeType = db.employeeType;
const Op = db.Sequelize.Op;

exports.create = async (req,res,next) => {
    try{
        let body = req.body;
        body.userId = req.userId;
        const employeeType = await EmployeeType.create(body);
        return res.status(httpStatus.CREATED).json({
            message: "Employee Type successfully created",
            employeeType
        });
       } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async(req,res,next) => {
    try{
        const employeeType = await EmployeeType.findAll({where:{isActive:true}});
        if(employeeType){
            return res.status(httpStatus.OK).json({
                message: "Employee Type Content Page",
                employeeType:employeeType
            });
        }
    }catch(error){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

