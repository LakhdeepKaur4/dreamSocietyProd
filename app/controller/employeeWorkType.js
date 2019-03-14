const db = require('../config/db.config.js');
const httpStatus = require('http-status')

const EmployeeWorkType = db.employeeWorkType;
const Op = db.Sequelize.Op;

exports.create = async (req,res,next) => {
    try{
        let body = req.body;
        body.userId = req.userId;
        const employeeWorkType = await EmployeeWorkType.create(body);
        return res.status(httpStatus.CREATED).json({
            message: "Employee Work Type successfully created",
            employeeWorkType:employeeWorkType
        });
       } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async(req,res,next) => {
    try{
        const employeeWorkType = await EmployeeWorkType.findAll({where:{isActive:true}});
        if(employeeWorkType){
            return res.status(httpStatus.OK).json({
                message: "Employee Work Type Content Page",
                employeeWorkType:employeeWorkType
            });
        }
    }catch(error){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}