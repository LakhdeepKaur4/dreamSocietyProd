const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');

const City = db.city;
const Country = db.country;
const State = db.state;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
    console.log("creating city");

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
    }).then(city => {
        res.json({ message: "City added successfully!", city: city });
    }).catch(err => {
        res.status(500).send("Fail! Error -> " + err);
    })
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
            return city.updateAttributes(updates)
        })
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
            return city.updateAttributes(updates)
        })
        .then(updatedCity => {
            res.json({ message: "City updated successfully!", updatedCity: updatedCity });
        });
    }
}

exports.deleteById = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const city = await City.findOne({ where: { cityId: id } });
        if (!city) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id does not exists" });
        }
        const deletedCity = await City.destroy({ where: { cityId: id } })

        if (deletedCity) {
            return res.status(httpStatus.OK).json({
                message: "City deleted successfully",
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
        const updatedCity = await City.find({ where: { cityId: id } }).then(city => {
            return city.updateAttributes(update)
        })
        if (updatedCity) {
            return res.status(httpStatus.OK).json({
                message: "City deleted successfully",
                city: updatedCity
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
        const updatedCity = await City.update(update, { where: { cityId: { [Op.in]: deleteSelected } } })
        if (updatedCity) {
            return res.status(httpStatus.OK).json({
                message: "Cities deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}