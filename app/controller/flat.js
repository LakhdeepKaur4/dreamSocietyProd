const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status')

const Flat = db.flat;
const Society = db.society;
const Size = db.size;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
    console.log("creating flat");
    let body = req.body;
    body.userId = req.userId;
    console.log("req.body==>", req.body)
    Flat.create({
        flatType: req.body.flatType,
        coverArea: req.body.coverArea,
        flatSuperArea: req.body.flatSuperArea,
        societyId: req.body.societyId,
        sizeId: req.body.sizeId,
        userId: req.userId
    }).then(flat => {
        res.json({ message: "Flat added successfully!", flat: flat });
    }).catch(err => {
        // console.log("error===>",err)
        res.status(500).send("Fail! Error -> " + err);
    })
}

exports.get = async (req, res) => {
    const data = await Flat.findAndCountAll({where:{isActive:true}});
    Flat.findAll({
        where: {
            isActive: true
        },
        order: [['createdAt', 'DESC']],
        include: [
            {
                model: Society,
                attributes: ['societyId', 'societyName']
            },
            {
                model: Size,
                attributes: ['sizeId', 'sizeType']
            },
        ]
    }) 
        .then(flat => {
            res.json({count:data.count,flat});
        });
}

exports.getById = (req, res) => {
    Flat.findOne({
        where: { id: req.userId },
    }).then(flat => {
        res.status(200).json({
            "description": "Flat Content Page",
            "flat": flat
        });
    }).catch(err => {
        res.status(500).json({
            "description": "Can not Flat Page",
            "error": err
        });
    })
}

exports.update = (req, res) => {
    const id = req.params.id;

    if (!id || id === undefined) {
        res.status(422).json("Please enter id");
    }
    const updates = req.body;
    console.log("flat update ===>", updates)
    Flat.find({
        where: { flatId: id }
    })
        .then(flat => {
            return flat.updateAttributes(updates)
        })
        .then(updatedFlat => {
            res.json({ message: "Flat updated successfully!", updatedFlat: updatedFlat });
        });
}

exports.delete = (req, res) => {
    const id = req.params.id;
    console.log("id==>", id)
    if (!id || id === undefined) {
        res.json("Id missing");
    }
    const updates = req.body;
    console.log("update====>>>>", updates)
    Flat.find({
        where: { flatId: id }
    })
        .then(flat => {
            return flat.updateAttributes(updates)
        })
        .then(deletedFlat => {
            res.json({ message: "Flat deleted successfully!", deletedFlat: deletedFlat });
        });
}

exports.getFlatByPageNumber = async (req, res, next) => {
    try {
        let limit = 5;
        let offset = 0;
        let page = req.params.page;
        offset = limit * (page - 1);
        const data = await Flat.findAndCountAll();
        // let pages = Math.ceil(data.count / limit);
        const flat = await Flat.findAll({
            where: { isActive: true },
            limit: limit,
            offset: offset,
            include: [
                {
                    model: Society,
                    attributes: ['societyId', 'societyName']
                },
                {
                    model: Size,
                    attributes: ['sizeId', 'sizeType']
                },
            ]
        });
        if (flat) {
            return res.status(httpStatus.CREATED).json({
                message: "Flat Content Page",
                flat: flat
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getFlatByLimit = async (req, res, next) => {
    try {
        console.log("body===>", req.body.limit)
        let limit = parseInt(req.query.limit);
        let offset = 0;
        let page = parseInt(req.query.page);
        offset = limit * (page - 1);
        const count = await Flat.findAndCountAll({ where: { isActive: true } });
        // let pages = Math.ceil(data.count / limit);
        const flat = await Flat.findAll({
            where: { isActive: true },
            limit: limit,
            offset: offset,
            include: [
                {
                    model: Society,
                    attributes: ['societyId', 'societyName']
                },
                {
                    model: Size,
                    attributes: ['sizeId', 'sizeType']
                },
            ]
        });
        if (flat) {
            return res.status(httpStatus.CREATED).json({
                message: "Flat Content Page",
                totalCount: count.count,
                flat: flat
            });
        }
    } catch (error) {
        console.log("error==>", error)
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
        const updatedFlat = await Flat.update(update, { where: { flatId: { [Op.in]: deleteSelected } } })
        if (updatedFlat) {
            return res.status(httpStatus.OK).json({
                message: "Flats deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}