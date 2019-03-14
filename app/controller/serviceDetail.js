const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');

const ServiceDetail = db.serviceDetail;

exports.create = async (req, res, next) => {
    try {
        let body = req.body;
        body.userId = req.userId;
        const service = await ServiceDetail.create(body);
        return res.status(httpStatus.CREATED).json({
            message: "Service Detail successfully created",
            service:service
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async(req,res,next) => {
    try{
        const service = await ServiceDetail.findAll({where:{isActive:true}});
        if(service){
            return res.status(httpStatus.CREATED).json({
                message: "Service Content Page",
                service:service
            });
        }
    }catch(error){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

