const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');

const City = db.city;
const Country = db.country;
const State = db.state;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
    console.log("creating city");
    let transaction;
    try{
        transaction = await db.sequelize.transaction();
        const cities = await City.findAll({
            where: {
                [Op.and]:[
                    {isActive: true},
                    { stateId: req.body.stateId },
                    { countryId: req.body.countryId },
                ]
            }
        })
        // console.log(cities);
        let error = cities.some(city => {
            return city.cityName.toLowerCase().replace(/ /g, '') == req.body.cityName.toLowerCase().replace(/ /g, '');
        });
        if (error) {
            console.log("inside state");
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "City Name already Exists" })
        }
        City.create({
            countryId: req.body.countryId,
            cityName: req.body.cityName,
            cityId: req.body.cityId,
            stateId: req.body.stateId,
            userId: req.userId
        },transaction).then(async (city) => {
            await transaction.commit();
            res.json({ message: "City added successfully!", city: city });
        }).catch(async(err) => {
            if (transaction) await transaction.rollback();
            res.status(500).send("Fail! Error -> " + err);
        })
    }
    catch(err){
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
    }
    }
    

exports.get = (req, res) => {
    console.log("getting city==>")
    City.findAll({
        where: { isActive: true },
        order: [['createdAt', 'DESC']],
        include: [{ where:{isActive:true},model: State, attributes: ['stateId', 'stateName'] },
         { where:{isActive:true},model: Country, attributes: ['countryId', 'countryName'] }]
    })
        .then(cities => {
            res.json(cities);
        });
}

exports.getById = (req, res) => {
    City.findAll({
        where: {
            [Op.and]: [
                { stateId: req.params.id },
                { isActive: true }
            ]
        },
    }).then(city => {
        res.status(200).json(
            city
        );
    }).catch(err => {
        res.status(500).json({
            "description": "Can not city Page",
            "error": err
        });
    })
}

exports.update = async (req, res) => {
    let transaction;
    try{
        transaction = await sequelize.transaction();
        const id = req.params.id;
        if (!id) {
            res.json("Please enter id");
        }
        const updates = req.body;
        const city = await City.findOne({
            where:{
                cityId:id,
                isActive:true
            }
        })
    
        if(city.cityName === updates.cityName){
            const updatedCity = await City.find({ where: { cityId: id } }).then(city => {
                return city.updateAttributes(updates,transaction)
            })
            await transaction.commit();
            if (updatedCity) {
                return res.status(httpStatus.OK).json({
                    message: "City Updated Page",
                    updatedCity: updatedCity
                });
            }
        }else{
        const cities = await City.findAll({
            where: {
                [Op.and]:[
                    {isActive: true},
                    { stateId: req.body.stateId },
                    { countryId: req.body.countryId },
                ]
            }
        })
        console.log(cities);
        let error = cities.some(city => {
            return city.cityName.toLowerCase().replace(/ /g, '') == req.body.cityName.toLowerCase().replace(/ /g, '');
        });
        console.log(error);
        if (error) {
            console.log("inside city");
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "City Name already Exists" })
        }
        City.find({
            where: { cityId: id }
        })
            .then(city => {
                return city.updateAttributes(updates,transaction)
            })
            .then(async (updatedCity) => {
                await transaction.commit();
                res.json({ message: "City updated successfully!", updatedCity: updatedCity });
            });
        }
    } catch(err){
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
    }
   
}

exports.deleteById = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const id = req.params.id;

        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const city = await City.findOne({ where: { cityId: id } });
        if (!city) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id does not exists" });
        }
        const deletedCity = await City.destroy({ where: { cityId: id },transaction})
        await transaction.commit();
        if (deletedCity) {
            return res.status(httpStatus.OK).json({
                message: "City deleted successfully",
            });

        }
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.delete = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const id = req.params.id;

        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedCity = await City.find({ where: { cityId: id } }).then(city => {
            return city.updateAttributes(update,transaction)
        })
        await transaction.commit();
        if (updatedCity) {
            return res.status(httpStatus.OK).json({
                message: "City deleted successfully",
                city: updatedCity
            });
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.deleteSelected = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction
        const deleteSelected = req.body.ids;
        console.log("delete selected==>", deleteSelected);
        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const updatedCity = await City.update(update, { where: { cityId: { [Op.in]: deleteSelected } },transaction })
        await transaction.commit();
        if (updatedCity) {
            return res.status(httpStatus.OK).json({
                message: "Cities deleted successfully",
            });
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}