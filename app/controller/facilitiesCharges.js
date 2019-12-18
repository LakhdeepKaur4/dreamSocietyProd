const db = require('../config/db.config.js');
const UserFacility = db.userFacility;
const Facility = db.facilities;
const FacilityDetail = db.facilitiesDetails;
const FacilityCharges = db.facilitiesCharges;
const Op = db.Sequelize.Op;
const httpStatus = require('http-status');

exports.calculateFacilitiesCharges = async (req, res, next) => {
    try {
        // let dateToday = new Date(Date.now());
        let chargesArr = [];
        await UserFacility.findAll({
            where: {
                isActive: true
            },
            include: [FacilityDetail],
            order: [['createdAt', 'DESC']]
        })
            .then(async (facilities) => {
                facilities.map(facility => {
                    facility = facility.toJSON();
                    facility['facilityDetailId'] = facility.facilityDetailId;
                    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                    const firstDate = new Date(facility.startDate);
                    const secondDate = new Date(facility.endDate);
                    const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
                    if (diffDays == 30) {
                        facility['month'] = 1;
                    } else if (diffDays == 60) {
                        facility['month'] = 2;
                    } else if (diffDays == 120) {
                        facility['month'] = 4;
                    } else if (diffDays == 180) {
                        facility['month'] = 6;
                    } else if (diffDays == 360) {
                        facility['month'] = 12;
                    }
                    if (facility.facilities_details_master.monthlyRate != null) {
                        facility['rate'] = facility.facilities_details_master.monthlyRate;
                    }
                    if (facility.facilities_details_master.unitRate != null) {
                        facility['rate'] = facility.facilities_details_master.unitRate;
                    }
                    facility['monthlyCharges'] = facility.rate * facility.month;
                    facility['from'] = facility.startDate;
                    facility['to'] = facility.endDate;
                    chargesArr.push(facility);
                })
            })
        if (chargesArr) {
            const facilitiesCharges = await FacilityCharges.bulkCreate(
                chargesArr, {
                returning: true
            },
            );
            res.json(chargesArr);
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const userId = req.userId;
        const facilityCharges = await FacilityCharges.findAll({
            where: { isActive: true, userId: userId },
            include: [{ model: FacilityDetail, include: [Facility] }],
            order: [['createdAt', 'DESC']],
        });
        if (facilityCharges) {
            return res.status(httpStatus.OK).json({
                message: "Facility Charges Content Page",
                facilityCharges
            });
        }
    } catch (error) {
        console.log(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getAllFacilityCharges = async (req, res, next) => {
    try {
        const facilityCharges = await FacilityCharges.findAll({
            where: { isActive: true },
            include: [{ model: FacilityDetail, include: [Facility] }],
            order: [['createdAt', 'DESC']],
        });
        if (facilityCharges) {
            return res.status(httpStatus.OK).json({
                message: "Facility Charges Content Page",
                facilityCharges
            });
        }
    } catch (error) {
        console.log(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}