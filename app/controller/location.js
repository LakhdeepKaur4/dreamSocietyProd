const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status')


const Location = db.location;
const State = db.state;
const Country = db.country;
const City = db.city;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
    console.log("creating location");
    let body = req.body;
    console.log(body);
    // const location = await Location.findOne({
    //     where: {
    //         [Op.and]: [
    //             { locationName: req.body.locationName },
    //             { isActive: true }
    //         ]
    //     }
    // })
    // if (location) {
    //     return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Location Name already Exists" })
    // }
    const locations = await Location.findAll({
        where: {
            [Op.and]: [
                { isActive: true },
                { stateId: req.body.stateId },
                { countryId: req.body.countryId },
                { cityId: req.body.cityId },
            ]
        }
    })
    // console.log(cities);
    let error = locations.some(location => {
        return location.locationName.toLowerCase().replace(/ /g, '') == req.body.locationName.toLowerCase().replace(/ /g, '');
    });
    if (error) {
        console.log("inside state");
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Location Name already Exists" })
    }
    Location.create({
        locationName: body.locationName,
        countryId: body.countryId,
        stateId: body.stateId,
        cityId: body.cityId,
        userId: req.userId
    }).then(location => {
        res.json({ message: "Location added successfully!", location: location });
    }).catch(err => {
        res.status(500).json("Fail! Error -> " + err);
    })
}

exports.get = (req, res) => {
    Location.findAll({
        where: { isActive: true },
        order: [['createdAt', 'DESC']],
        include: [{ where: { isActive: true }, model: State, attributes: ['stateId', 'stateName'] },
        { where: { isActive: true }, model: Country, attributes: ['countryId', 'countryName'] },
        { where: { isActive: true }, model: City, attributes: ['cityId', 'cityName'] },
        ]
    })
        .then(location => {
            res.json(location);
        });
}

exports.getById = (req, res) => {
    Location.findAll({
        where: { isActive:true,cityId: req.params.id },
    }).then(location => {
        res.status(200).json(
            location
        );
    }).catch(err => {
        res.status(500).json({
            "description": "Can not Location Page",
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
    console.log("updates==>", updates);

    const location = await Location.findOne({
        where: {
            [Op.and]: [
                { isActive: true },
                { locationId: id },
                { stateId: req.body.stateId },
                { countryId: req.body.countryId },
                { cityId: req.body.cityId },
            ]
        }
    })
    console.log("location==>", location)
    if(location != null){
    if (location.locationName === updates.locationName) {
        const updatedLocation = await Location.find({ where: { locationId: id } }).then(location => {
            return location.updateAttributes(updates)
        })
        if (updatedLocation) {
            return res.status(httpStatus.OK).json({
                message: "Location Updated Page",
                updatedLocation: updatedLocation
            });
        }
    }
    } else {
        const locations = await Location.findAll({
            where: {
                [Op.and]: [
                    { isActive: true },
                    { stateId: req.body.stateId },
                    { countryId: req.body.countryId },
                    { cityId: req.body.cityId },
                ]
            }
        })
        console.log(locations);
        let error = locations.some(location => {
            return location.locationName.toLowerCase().replace(/ /g, '') == req.body.locationName.toLowerCase().replace(/ /g, '');
        });
        if (error) {
            console.log("inside state");
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Location Name already Exists" })
        }
        Location.find({
            where: { locationId: id }
        })
            .then(location => {
                return location.updateAttributes(updates)
            })
            .then(updatedLocation => {
                res.json({ message: "Location updated successfully!", updatedLocation: updatedLocation });
            });
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
        const updatedLocation = await Location.find({ where: { locationId: id } }).then(location => {
            return location.updateAttributes(update)
        })
        if (updatedLocation) {
            return res.status(httpStatus.OK).json({
                message: "Location deleted successfully",
                location: updatedLocation
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
        const updatedLocation = await Location.update(update, { where: { locationId: { [Op.in]: deleteSelected } } })
        if (updatedLocation) {
            return res.status(httpStatus.OK).json({
                message: "Locations deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

