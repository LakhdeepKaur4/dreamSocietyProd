const db = require("../config/db.config.js");
const config = require("../config/config.js");
const httpStatus = require("http-status");
const crypto = require('crypto');
var passwordGenerator = require('generate-password');
const Nexmo = require("nexmo");
const fs = require("fs");
const key = config.secret;
const jwt = require('jsonwebtoken');
const Op = db.Sequelize.Op;
const path = require("path");
const Vendor = db.vendor;
const PurchaseOrder = db.purchaseOrder;
const PurchaseOrderDetails = db.purchaseOrderDetails;
const pdf = require('html-pdf');
const pdfTemplate = require('../../public/documents/pdftemplate');
const mailjet = require('node-mailjet').connect(config.mail_public_key, config.mail_secret_key);
const Asset = db.assets;
const fsExtra = require('fs-extra');
const Hbs = require('handlebars');
const Path = require('path');
const Moment = require('moment');


function decrypt(key, data) {
    var decipher = crypto.createDecipher('aes-128-cbc', key);
    var decrypted = decipher.update(data, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
}


let mailToUser = (email, vendorId, purchaseOrder) => {
    const token = jwt.sign({
        data: 'foo'
    },
        'secret', {
            expiresIn: '24h'
        });
    vendorId = encrypt(key, vendorId.toString());
    const request = mailjet.post("send", {
        'version': 'v3.1'
    })
        .request({
            "Messages": [{
                "From": {
                    "Email": "rohit.khandelwal@greatwits.com",
                    "Name": "Greatwits"
                },
                "To": [{
                    "Email": email,
                    "Name": 'Atin' + ' ' + 'Tanwar'
                }],
                "Subject": "Purchase Order",
                "HTMLPart": `<b>Click on the given link to download your purchase order</b> <a href="http://mydreamsociety.com/downloadPdf?vendorId=${vendorId}&pdfDocument=purchaseOrder${purchaseOrder}">click here</a>`
            }]
        })
    request.then((result) => {
        console.log(result.body)
        // console.log(`http://192.168.1.105:3000/submitotp?userId=${encryptedId}token=${encryptedToken}`);
    })
        .catch((err) => {
            console.log(err.statusCode)
        })
}

exports.create = async (req, res, next) => {
    try {
        let purchaseOrderService = [];
        let purchaseOrderAssets = []

        let purchaseOrder = await PurchaseOrder.create({
            vendorId: req.body.vendorId,
            issuedBy: req.body.issuedBy,
            expDateOfDelievery: req.body.expectedDateOfDelievery
        });
        if (req.body.purchaseOrderAssetsArray) {
            purchaseOrderAssets = await PurchaseOrderDetails.bulkCreate(
                req.body.purchaseOrderAssetsArray, {
                    returning: true
                }, {
                    fields: ["purchaseOrderDetailId", "purchaseOrderType", "purchaseOrderName", "rate", "quantity", "amount", "serviceStartDate", "serviceEndDate", "issuedBy", "expDateOfDelievery", "purchaseOrderId"]
                    // updateOnDuplicate: ["name"]
                }
            );
        }

        let update = {
            purchaseOrderId: purchaseOrder.purchaseOrderId
        }
        purchaseOrderAssets.forEach(x => x.updateAttributes(update));



        if (req.body.purchaseOrderServiceArray) {
            purchaseOrderService = await PurchaseOrderDetails.bulkCreate(
                req.body.purchaseOrderServiceArray, {
                    returning: true
                }, {
                    fields: ["purchaseOrderDetailId", "purchaseOrderType", "rate", "quantity", "amount", "serviceStartDate", "serviceEndDate", "issuedBy", "expDateOfDelievery", "purchaseOrderId"]
                    // updateOnDuplicate: ["name"]
                }
            );
        }

        purchaseOrderService.forEach(x => x.updateAttributes(update));
        // console.log("purchaseOrder =====> ", pdf)

        await pdf.create(pdfTemplate(purchaseOrderAssets, purchaseOrderService, purchaseOrder.issuedBy, purchaseOrder.expDateOfDelievery), {
            format: 'Letter'
        }).toFile(`./public/purchaseOrderPdfs/purchaseOrder${purchaseOrder.purchaseOrderId}.pdf`, (err, res) => {
            if (err) {
                console.log("Pdf generation error ======>", err);
            } else {
                console.log("Pdf generated successfully");
            }

        });
        let vendor = await Vendor.findOne({
            where: {
                isActive: true,
                vendorId: req.body.vendorId
            }
        })
        if (vendor) {
            console.log("vendor=======>", decrypt(key, vendor.firstName));
            mailToUser(decrypt(key, vendor.email), vendor.vendorId, purchaseOrder.purchaseOrderId);
        }

        // console.log("dgsfhgsahjgfjah ===============>");
        return res.status(httpStatus.CREATED).json({
            message: "Purchase Order registered",
        });


    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);

    }
}

exports.get = async (req, res, next) => {
    try {
        let purchaseOrder = await PurchaseOrder.findAll({
            where: {
                isActive: true
            },
            include: [{
                model: Vendor
            }]
        });
        let purchaseNew = [];
        const promise = purchaseOrder.map(async x => {
            x = x.toJSON();
            x.assets = await PurchaseOrderDetails.findAll({
                where: {
                    isActive: true,
                    purchaseOrderId: x.purchaseOrderId,
                    purchaseOrderType: "Assets"
                }
            });
            x.services = await PurchaseOrderDetails.findAll({
                where: {
                    isActive: true,
                    purchaseOrderId: x.purchaseOrderId,
                    purchaseOrderType: "Service"
                }
            });
            x.vendor_master.firstName = decrypt(key, x.vendor_master.firstName);
            x.vendor_master.lastName = decrypt(key, x.vendor_master.lastName);
            x.vendor_master.contact = decrypt(key, x.vendor_master.contact);
            x.vendor_master.email = decrypt(key, x.vendor_master.email);
            purchaseNew.push(x);
            // console.log("purchaseOrder======>", purchaseNew);
        });
        Promise.all(promise).then(() => {
            console.log("atin============>")
            return res.status(httpStatus.CREATED).json({
                message: "Purchase Order",
                purchaseOrder: purchaseNew
            });
        })

    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.delete = async (req, res, next) => {
    try {
        let id = req.params.id;

        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                message: "Id is missing"
            });
        }
        let update = {
            isActive: false
        };
        let purchaseOrder = await PurchaseOrder.findOne({
            where: {
                isActive: true,
                purchaseOrderId: id
            }
        });
        purchaseOrder.updateAttributes(update);
        const purchaseOrderDetails = await PurchaseOrderDetails.update(update, {
            where: {
                purchaseOrderId: id
            }
        })

        if (purchaseOrder && purchaseOrderDetails) {
            return res.status(httpStatus.OK).json({
                message: "PurchaseOrder deleted successfully",
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

        const update = {
            isActive: false
        };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                message: "No id Found"
            });
        }
        const updatedPurchaseOrder = await PurchaseOrder.update(update, {
            where: {
                purchaseOrderId: {
                    [Op.in]: deleteSelected
                }
            }
        });
        const updatedPurchaseOrderDetails = await PurchaseOrderDetails.update(update, {
            where: {
                purchaseOrderId: {
                    [Op.in]: deleteSelected
                }
            }
        });

        if (updatedPurchaseOrder && updatedPurchaseOrderDetails) {
            return res.status(httpStatus.OK).json({
                message: "PurchaseOrders deleted successfully",
            });
        }
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);

    }
}

exports.updatePurchaseOrder = async (req, res, next) => {
    try {
        let data = {};
        let id = req.params.id;
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                message: "No id Found"
            });
        };
        console.log("id", id);
        let update = req.body;
        console.log("update", update);
        await PurchaseOrder.find({
            where: {
                isActive: true,
                purchaseOrderId: id
            }
        }).then(POrder => {
            POrder.updateAttributes(update);
        })
        // console.log("porder", porder);

        let purchaseOrderAssets = await PurchaseOrderDetails.findAll({
            where: {
                isActive: true,
                purchaseOrderId: id,
                purchaseOrderType: "Assets"
            }
        });
        console.log("purchaseOrderAssets======>", purchaseOrderAssets);
        let purchaseOrderService = await PurchaseOrderDetails.findAll({
            where: {
                isActive: true,
                purchaseOrderId: id,
                purchaseOrderType: "Service"
            }
        });
        await PurchaseOrder.find({
            where: {
                isActive: true,
                purchaseOrderId: id
            }
        })
            .then(async porder => {
                fs.unlink(`./public/purchaseOrderPdfs/purchaseOrder${porder.purchaseOrderId}.pdf`, (err) => {
                    if (err) {
                        console.log('File is missing ===>', err);
                    } else {
                        console.log('File deleted successfully');
                    }
                });

                await pdf.create(pdfTemplate(purchaseOrderAssets, purchaseOrderService, porder.issuedBy, porder.expDateOfDelievery), {
                    format: 'Letter'
                }).toFile(`./public/purchaseOrderPdfs/purchaseOrder${porder.purchaseOrderId}.pdf`, (err, res) => {
                    if (err) {
                        console.log("Pdf generation error ======>", err);
                    } else {
                        console.log("Pdf generated successfully");
                    }

                });

                let vendor = await Vendor.findOne({
                    where: {
                        isActive: true,
                        vendorId: porder.vendorId
                    }
                })
                if (vendor) {
                    console.log("vendor=======>", decrypt(key, vendor.firstName));
                    mailToUser(decrypt(key, vendor.email), vendor.vendorId, porder.purchaseOrderId);
                }

                if (porder) {
                    return res.status(httpStatus.OK).json({
                        message: "PurchaseOrders updated successfully",
                    });
                }
            })

    } catch (error) {
        console.log("error=============>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);

    }
}

exports.updatePurchaseOrderDetails = async (req, res, next) => {
    try {
        let data = {};
        console.log("===============>", req.body);
        let purchaseDetailId = req.params.id;
        let id;
        let update = req.body;

        await PurchaseOrderDetails.findOne({
            where: {
                isActive: true,
                purchaseOrderDetailId: purchaseDetailId
            }
        })
            .then(async POrderDetail => {
                POrderDetail.updateAttributes(update);
                id = POrderDetail.purchaseOrderId;
            })




        let purchaseOrderAssets = await PurchaseOrderDetails.findAll({
            where: {
                isActive: true,
                purchaseOrderId: id,
                purchaseOrderType: "Assets"
            }
        });
        console.log("purchaseOrderAssets======>", purchaseOrderAssets);
        let purchaseOrderService = await PurchaseOrderDetails.findAll({
            where: {
                isActive: true,
                purchaseOrderId: id,
                purchaseOrderType: "Service"
            }
        });

        await PurchaseOrder.find({
            where: {
                isActive: true,
                purchaseOrderId: id
            }
        })
            .then(async porder => {
                fs.unlink(`./public/purchaseOrderPdfs/purchaseOrder${porder.purchaseOrderId}.pdf`, (err) => {
                    if (err) {
                        console.log('File is missing ===>', err);
                    } else {
                        console.log('File deleted successfully');
                    }
                });

                await pdf.create(pdfTemplate(purchaseOrderAssets, purchaseOrderService, porder.issuedBy, porder.expDateOfDelievery), {
                    format: 'Letter'
                }).toFile(`./public/purchaseOrderPdfs/purchaseOrder${porder.purchaseOrderId}.pdf`, (err, res) => {
                    if (err) {
                        console.log("Pdf generation error ======>", err);
                    } else {
                        console.log("Pdf generated successfully");
                    }

                });

                let vendor = await Vendor.findOne({
                    where: {
                        isActive: true,
                        vendorId: porder.vendorId
                    }
                })
                if (vendor) {
                    console.log("vendor=======>", decrypt(key, vendor.firstName));
                    mailToUser(decrypt(key, vendor.email), vendor.vendorId, porder.purchaseOrderId);
                }

                if (porder) {
                    return res.status(httpStatus.OK).json({
                        message: "PurchaseOrderDetails updated successfully",
                    });
                }
            })

    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.downloadPDF = async (req, res, next) => {
    try {
        let pdfId = req.query.pdfDocument;
        if (!pdfId) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                message: "No id Found"
            });

        }
        return res.download(`./public/purchaseOrderPdfs/${pdfId}.pdf`, 'purchaseOrder.pdf', function (err) {
            if (err) {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: "File not found"
                });
            }
        })
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.downloadPdfClient = async (req, res, next) => {
    try {
        let id = req.params.id;
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                message: "No id Found"
            });
        }

        return res.status(httpStatus.OK).json({
            message: `public\\purchaseOrderPdfs\\purchaseOrder${id}.pdf`
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.update = async (req, res, next) => {
    let data = {};
    let purchaseOrderService = [];
    let purchaseOrderAssets = [];
    let id = req.params.id;
    let updatePurchaseOrder = {
        vendorId: req.body.vendorId,
        issuedBy: req.body.issuedBy,
        expDateOfDelievery: req.body.expectedDateOfDelievery
    }
    let purchaseOrder = await PurchaseOrder.findOne({
        where: {
            isActive: true,
            purchaseOrderId: id
        }
    });
    purchaseOrder.updateAttributes(updatePurchaseOrder);

    let purchaseOrderAssetsDelete = await PurchaseOrderDetails.findAll({
        where: {
            isActive: true,
            purchaseOrderId: id,
            purchaseOrderType: "Assets"
        }
    });
    purchaseOrderAssetsDelete.map(x => x.destroy());

    let purchaseOrderServiceDelete = await PurchaseOrderDetails.findAll({
        where: {
            isActive: true,
            purchaseOrderId: id,
            purchaseOrderType: "Service"
        }
    });
    purchaseOrderServiceDelete.map(x => x.destroy());


    if (req.body.purchaseOrderAssetsArray) {
        purchaseOrderAssets = await PurchaseOrderDetails.bulkCreate(
            req.body.purchaseOrderAssetsArray, {
                returning: true
            }, {
                fields: ["purchaseOrderDetailId", "purchaseOrderType", "purchaseOrderName", "rate", "quantity", "amount", "serviceStartDate", "serviceEndDate", "issuedBy", "expDateOfDelievery", "purchaseOrderId"]
                // updateOnDuplicate: ["name"]
            }
        );
    }

    let update = {
        purchaseOrderId: purchaseOrder.purchaseOrderId
    }
    purchaseOrderAssets.forEach(x => x.updateAttributes(update));



    if (req.body.purchaseOrderServiceArray) {
        purchaseOrderService = await PurchaseOrderDetails.bulkCreate(
            req.body.purchaseOrderServiceArray, {
                returning: true
            }, {
                fields: ["purchaseOrderDetailId", "purchaseOrderType", "rate", "quantity", "amount", "serviceStartDate", "serviceEndDate", "issuedBy", "expDateOfDelievery", "purchaseOrderId"]
                // updateOnDuplicate: ["name"]
            }
        );
    }

    purchaseOrderService.forEach(x => x.updateAttributes(update));

    data.purchaseOrderAssets = purchaseOrderAssets;
    data.purchaseOrderService = purchaseOrderService;
    data.issuedBy = purchaseOrder.issuedBy;
    data.expectedDateOfDelievery = purchaseOrder.expDateOfDelievery;


    const today = new Date();
    let total = 0;
    if (purchaseOrderAssets.length > 0) {
        purchaseOrderAssets.forEach((asset) => {
            total = total + asset.amount;
        });
    }
    if (purchaseOrderService.length > 0) {
        purchaseOrderService.forEach((service) => {
            total = total + service.amount;
        })
    }

    data.today = `${`${today.getDate()}. ${today.getMonth() + 1}. ${today.getFullYear()}`}`;
    data.total = total

    console.log("data====================>", data);

    // const browser = await Puppeteer.launch(
    //     {
    //         'args': [
    //             '--no-sandbox',
    //             '--disable-setuid-sandbox'
    //         ]
    //     });
    // const page = await browser.newPage();
    // const content = await compile('purchaseOrderTemplate', data)
    // await page.setContent(content);
    // console.log("hello");
    // await page.emulateMedia('screen');
    // console.log("Hi");
    // await page.pdf({
    //     path: `./public/purchaseOrderPdfs/purchaseOrder${purchaseOrder.purchaseOrderId}.pdf`,
    //     format: 'A4',
    //     printBackground: true
    // });

    // console.log("done");
    // await browser.close();

    let vendor = await Vendor.findOne({
        where: {
            isActive: true,
            vendorId: req.body.vendorId
        }
    })
    if (vendor) {
        console.log("vendor=======>", decrypt(key, vendor.firstName));
        mailToUser(decrypt(key, vendor.email), vendor.vendorId, purchaseOrder.purchaseOrderId);
    }

    console.log("dgsfhgsahjgfjah ===============>");
    return res.status(httpStatus.CREATED).json({
        message: "Purchase Order updated",
    });
}


exports.getAssets = async (req, res, next) => {
    try {
        let id = req.params.id;
        let assetsArray = await PurchaseOrderDetails.findAll({
            where: {
                isActive: true,
                purchaseOrderType: "Assets",
                purchaseOrderId: id
            }
        });
        return res.status(httpStatus.CREATED).json({
            message: "Assets",
            assets: assetsArray
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }

}

exports.getServices = async (req, res, next) => {
    try {
        let id = req.params.id;
        let serviceArray = await PurchaseOrderDetails.findAll({
            where: {
                isActive: true,
                purchaseOrderType: "Service",
                purchaseOrderId: id
            }
        });
        return res.status(httpStatus.CREATED).json({
            message: "Services",
            assets: serviceArray
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }

}



exports.deletePurchaseOrderDetails = async (req, res, next) => {
    try {
        let data = {};
        console.log("===============>", req.params);
        let purchaseDetailId = req.params.id;
        let id;
        let update = {
            isActive: false
        };
        let x = await PurchaseOrderDetails.findOne({
            where: {
                isActive: true,
                purchaseOrderDetailId: purchaseDetailId
            }
        });
        x.updateAttributes(update);
        id = x.purchaseOrderId
        let porder = await PurchaseOrder.find({
            where: {
                isActive: true,
                purchaseOrderId: id
            }
        });
        console.log("porder", porder);


        let purchaseOrderAssets = await PurchaseOrderDetails.findAll({
            where: {
                isActive: true,
                purchaseOrderId: id,
                purchaseOrderType: "Assets"
            }
        });
        console.log("purchaseOrderAssets======>", purchaseOrderAssets);
        let purchaseOrderService = await PurchaseOrderDetails.findAll({
            where: {
                isActive: true,
                purchaseOrderId: id,
                purchaseOrderType: "Service"
            }
        });
        data.purchaseOrderAssets = purchaseOrderAssets;
        data.purchaseOrderService = purchaseOrderService;
        data.issuedBy = porder.issuedBy;
        data.expectedDateOfDelievery = porder.expDateOfDelievery;


        const today = new Date();
        let total = 0;
        if (purchaseOrderAssets.length > 0) {
            purchaseOrderAssets.forEach((asset) => {
                total = total + asset.amount;
            });
        }
        if (purchaseOrderService.length > 0) {
            purchaseOrderService.forEach((service) => {
                total = total + service.amount;
            })
        }

        data.today = `${`${today.getDate()}. ${today.getMonth() + 1}. ${today.getFullYear()}`}`;
        data.total = total

        console.log("data====================>", data);

        const browser = await Puppeteer.launch(
            {
                'args': [
                    '--no-sandbox',
                    '--disable-setuid-sandbox'
                ]
            });
        const page = await browser.newPage();
        const content = await compile('purchaseOrderTemplate', data)
        await page.setContent(content);
        console.log("hello");
        await page.emulateMedia('screen');
        console.log("Hi");
        await page.pdf({
            path: `./public/purchaseOrderPdfs/purchaseOrder${porder.purchaseOrderId}.pdf`,
            format: 'A4',
            printBackground: true
        });

        console.log("done");
        await browser.close();
        let vendor = await Vendor.findOne({
            where: {
                isActive: true,
                vendorId: porder.vendorId
            }
        })
        if (vendor) {
            console.log("vendor=======>", decrypt(key, vendor.firstName));
            mailToUser(decrypt(key, vendor.email), vendor.vendorId, porder.purchaseOrderId);
        }
        if (porder) {
            return res.status(httpStatus.OK).json({
                message: "PurchaseOrderDetails updated successfully",
            });
        }


    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.deleteSelectedPurchaseOrderDetails = async (req, res, next) => {
    try {
        let data = {};
        console.log("===============>", req.body);
        let purchaseDetailId = req.body.ids;
        let id;
        let update = {
            isActive: false
        };
        let x = await PurchaseOrderDetails.findAll({
            where: {
                isActive: true,
                purchaseOrderDetailId: {
                    [Op.in]: purchaseDetailId
                }
            }
        });
        x.forEach((item) => {
            item.updateAttributes(update);
            id = item.purchaseOrderId
        })

        let porder = await PurchaseOrder.find({
            where: {
                isActive: true,
                purchaseOrderId: id
            }
        });
        console.log("porder", porder);


        let purchaseOrderAssets = await PurchaseOrderDetails.findAll({
            where: {
                isActive: true,
                purchaseOrderId: id,
                purchaseOrderType: "Assets"
            }
        });
        console.log("purchaseOrderAssets======>", purchaseOrderAssets);
        let purchaseOrderService = await PurchaseOrderDetails.findAll({
            where: {
                isActive: true,
                purchaseOrderId: id,
                purchaseOrderType: "Service"
            }
        });
        data.purchaseOrderAssets = purchaseOrderAssets;
        data.purchaseOrderService = purchaseOrderService;
        data.issuedBy = porder.issuedBy;
        data.expectedDateOfDelievery = porder.expDateOfDelievery;


        const today = new Date();
        let total = 0;
        if (purchaseOrderAssets.length > 0) {
            purchaseOrderAssets.forEach((asset) => {
                total = total + asset.amount;
            });
        }
        if (purchaseOrderService.length > 0) {
            purchaseOrderService.forEach((service) => {
                total = total + service.amount;
            })
        }

        data.today = `${`${today.getDate()}. ${today.getMonth() + 1}. ${today.getFullYear()}`}`;
        data.total = total

        console.log("data====================>", data);

        const browser = await Puppeteer.launch(
            {
                'args': [
                    '--no-sandbox',
                    '--disable-setuid-sandbox'
                ]
            });
        const page = await browser.newPage();
        const content = await compile('purchaseOrderTemplate', data)
        await page.setContent(content);
        console.log("hello");
        await page.emulateMedia('screen');
        console.log("Hi");
        await page.pdf({
            path: `./public/purchaseOrderPdfs/purchaseOrder${porder.purchaseOrderId}.pdf`,
            format: 'A4',
            printBackground: true
        });

        console.log("done");
        await browser.close();
        let vendor = await Vendor.findOne({
            where: {
                isActive: true,
                vendorId: porder.vendorId
            }
        })
        if (vendor) {
            console.log("vendor=======>", decrypt(key, vendor.firstName));
            mailToUser(decrypt(key, vendor.email), vendor.vendorId, porder.purchaseOrderId);
        }
        if (porder) {
            return res.status(httpStatus.OK).json({
                message: "PurchaseOrderDetails updated successfully",
            });
        }


    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


const compile = async function (templateName, data) {
    const filePath = Path.join(process.cwd(), 'templates', `${templateName}.hbs`);
    const html = await fsExtra.readFile(filePath, 'utf-8');
    return Hbs.compile(html)(data);
}

// Hbs.registerHelper('dateFormat', function (value, format) {
//     return Moment(value).format(format);
// })

Hbs.registerHelper("inc", function (value, options) {
    return parseInt(value) + 1;
});

exports.create1 = async (req, res, next) => {
    try {
        let data = {};
        let purchaseOrderService = [];
        let purchaseOrderAssets = [];

        let purchaseOrder = await PurchaseOrder.create({
            vendorId: req.body.vendorId,
            issuedBy: req.body.issuedBy,
            expDateOfDelievery: req.body.expectedDateOfDelievery
        });
        if (req.body.purchaseOrderAssetsArray) {
            purchaseOrderAssets = await PurchaseOrderDetails.bulkCreate(
                req.body.purchaseOrderAssetsArray, {
                    returning: true
                }, {
                    fields: ["purchaseOrderDetailId", "purchaseOrderType", "purchaseOrderName", "rate", "quantity", "amount", "serviceStartDate", "serviceEndDate", "issuedBy", "expDateOfDelievery", "purchaseOrderId"]
                    // updateOnDuplicate: ["name"]
                }
            );
        }

        let update = {
            purchaseOrderId: purchaseOrder.purchaseOrderId
        }
        purchaseOrderAssets.forEach(x => x.updateAttributes(update));



        if (req.body.purchaseOrderServiceArray) {
            purchaseOrderService = await PurchaseOrderDetails.bulkCreate(
                req.body.purchaseOrderServiceArray, {
                    returning: true
                }, {
                    fields: ["purchaseOrderDetailId", "purchaseOrderType", "rate", "quantity", "amount", "serviceStartDate", "serviceEndDate", "issuedBy", "expDateOfDelievery", "purchaseOrderId"]
                    // updateOnDuplicate: ["name"]
                }
            );
        }

        purchaseOrderService.forEach(x => x.updateAttributes(update));
        console.log("purchaseOrder =====> ", pdf);
        data.purchaseOrderAssets = purchaseOrderAssets;
        data.purchaseOrderService = purchaseOrderService;
        data.issuedBy = purchaseOrder.issuedBy;
        data.expectedDateOfDelievery = purchaseOrder.expDateOfDelievery;


        const today = new Date();
        let total = 0;
        if (purchaseOrderAssets.length > 0) {
            purchaseOrderAssets.forEach((asset) => {
                total = total + asset.amount;
            });
        }
        if (purchaseOrderService.length > 0) {
            purchaseOrderService.forEach((service) => {
                total = total + service.amount;
            })
        }

        data.today = `${`${today.getDate()}. ${today.getMonth() + 1}. ${today.getFullYear()}`}`;
        data.total = total

        console.log("data====================>", data);

        const browser = await Puppeteer.launch(
            {
                'args': [
                    '--no-sandbox',
                    '--disable-setuid-sandbox'
                ]
            });
        const page = await browser.newPage();
        const content = await compile('purchaseOrderTemplate', data)
        await page.setContent(content);
        console.log("hello");
        await page.emulateMedia('screen');
        console.log("Hi");
        await page.pdf({
            path: `./public/purchaseOrderPdfs/purchaseOrder${purchaseOrder.purchaseOrderId}.pdf`,
            format: 'A4',
            printBackground: true
        });

        console.log("done");
        await browser.close();
        let vendor = await Vendor.findOne({
            where: {
                isActive: true,
                vendorId: req.body.vendorId
            }
        })
        if (vendor) {
            console.log("vendor=======>", decrypt(key, vendor.firstName));
            mailToUser(decrypt(key, vendor.email), vendor.vendorId, purchaseOrder.purchaseOrderId);
        }

        console.log("dgsfhgsahjgfjah ===============>");
        return res.status(httpStatus.CREATED).json({
            message: "Purchase Order registered",
        });


    } catch (error) {
        console.log("error=============>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);

    }
}
