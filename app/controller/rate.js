const db = require('../config/db.config.js');
const httpStatus = require('http-status')

const Rate = db.rate;

exports.create = async (req,res,next) => {
    try{
        let body = req.body;
        body.userId = req.userId;
        const rate = await Rate.create(body);
        return res.status(httpStatus.CREATED).json({
            message: "Rate successfully created",
            rate
        });
       } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async(req,res,next) => {
    try{
        const rate = await Rate.findAll({where:{isActive:true}});
        if(rate){
            return res.status(httpStatus.CREATED).json({
                message: "Rate Content Page",
                rate:rate
            });
        }
    }catch(error){
        console.log("error==>",error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}
