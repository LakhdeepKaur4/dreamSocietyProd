const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');

const Country = db.country;
const Op = db.Sequelize.Op;


exports.create = async (req, res) => {
    let transaction;
    try {
        let body = req.body;
        // let countryName = body.countryName.replace(/ +/g, "");

        const countries = await Country.findAll({
            where: {
                isActive: true
            }
        })
        // console.log(countries);
        let error = countries.some(country => {
            return country.countryName.toLowerCase().replace(/ /g, '') == req.body.countryName.toLowerCase().replace(/ /g, '');
        });
        if (error) {
            // console.log("inside country");
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Country Name already Exists" })
        }
        transaction = await db.sequelize.transaction();
        Country.create({
            countryName: body.countryName,
            code: body.code,
            currency: body.currency,
            phoneCode: body.phoneCode,
            userId: req.userId
        }, { transaction }).then(async country => {
            await transaction.commit();
            return res.status(200).json({ message: "Country added successfully!", country: country });
        })
    } catch (error) {
        if (transaction) await transaction.rollback();
        return res.status(500).json("Fail! Error -> " + err);
    }
}

exports.get = (req, res) => {
    Country.findAll({ where: { isActive: true }, order: [['createdAt', 'DESC']] })
        .then(country => {
            res.json(country);
        });
}

exports.getById = (req, res) => {
    Country.findOne({
        where: { id: req.userId },
    }).then(country => {
        res.status(200).json({
            "description": "Country Content Page",
            "country": country
        });
    }).catch(err => {
        res.status(500).json({
            "description": "Can not Country Page",
            "error": err
        });
    })
}

exports.update = async (req, res) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const id = req.params.id;
        if (!id) {
            res.json("Please enter id");
        }
        const updates = req.body;

        const country = await Country.findOne({
            where: {
                countryId: id,
                isActive: true
            }
        })

        if (country.countryName === updates.countryName) {
            const updatedCountry = await Country.find({ where: { countryId: id } }).then(country => {
                return country.updateAttributes(updates, transaction);
            })
            await transaction.commit();
            if (updatedCountry) {
                return res.status(httpStatus.OK).json({
                    message: "Country Updated Page",
                    updatedCountry: updatedCountry
                });
            }
        } else {
            const countries = await Country.findAll({
                where: {
                    isActive: true
                }
            })
            // console.log(countries);
            let error = countries.some(country => {
                return country.countryName.toLowerCase().replace(/ /g, '') == req.body.countryName.toLowerCase().replace(/ /g, '');
            });
            if (error) {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Country Name already Exists" })
            }
            Country.find({
                where: {
                    isActive: true,
                    countryId: id
                },
            })
                .then(country => {
                    return country.updateAttributes(updates, transaction)
                })
                .then(async updatedCountry => {
                    await transaction.commit();
                    res.json({ message: "Country updated successfully!", updatedCountry: updatedCountry });
                }).catch(async err => {
                    if (transaction) await transaction.rollback();
                    return res.status(500).json("Fail! Error -> " + err);
                })
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
        return res.status(500).json("Fail! Error -> " + error);
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
        const updatedCountry = await Country.find({ where: { countryId: id } }).then(country => {
            return country.updateAttributes(update, transaction)
        })
        await transaction.commit();
        if (updatedCountry) {
            return res.status(httpStatus.OK).json({
                message: "Country deleted successfully",
                country: updatedCountry
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
        transaction = await db.sequelize.transaction();
        const deleteSelected = req.body.ids;
        // console.log("delete selected==>", deleteSelected);
        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const updatedCountry = await Country.update(update, { where: { countryId: { [Op.in]: deleteSelected } }, transaction });
        await transaction.commit();
        if (updatedCountry) {
            return res.status(httpStatus.OK).json({
                message: "Countries deleted successfully",
            });
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

