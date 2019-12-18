const db = require('../config/db.config.js');
const OwnerMembersDetail = db.ownerMembersDetail;
const TenantMembersDetail = db.tenantMembersDetail;
const OwnerFlatDetail = db.ownerFlatDetail;
const TenantFlatDetail = db.tenantFlatDetail;
const User = db.user;
const FlatDetail = db.flatDetail;
const Tower = db.tower;
const Floor = db.floor;
const Role = db.role;
const Op = db.Sequelize.Op;
const FingerprintData = db.fingerprintData;
const IndividualVendor = db.individualVendor;
const Service = db.service;
const RateType = db.rate;
const City = db.city;
const Location = db.location;
const Country = db.country;
const State = db.state;
const UserRFID = db.userRfid;
const RFID = db.rfid;

module.exports = {
    // async function userData(id, userData) {

    userHandler: async (id, userData) => {
        console.log("&&^&", id)
        await User.findOne({
            where: {
                userId: id,
                // isActive: true
            },
            include: [
                {
                    model: Role,
                    where: {
                        id: { [Op.in]: [3, 4] }
                    }
                },
            ]
        })
            .then(async user => {
                if (user !== null) {
                    user = user.toJSON();
                    user.firstName = decrypt(user.firstName);
                    user.lastName = decrypt(user.lastName);
                    user.userName = decrypt(user.userName);
                    user.contact = decrypt(user.contact);
                    user.email = decrypt(user.email);
                    user.flatDisable = true;
                    const flatIds = [];
                    if (user.roles.length === 1) {
                        if (user.roles[0].id === 3) {
                            const OwnerFlats = await OwnerFlatDetail.findAll({
                                where: {
                                    ownerId: user.userId,
                                    isActive: true,
                                },
                                attributes: ['flatDetailId']
                            })

                            if (OwnerFlats.length !== 0) {
                                OwnerFlats.map(item => {
                                    flatIds.push(item.flatDetailId);
                                })
                            }
                            else {
                                const OwnerMemberFlat = await OwnerMembersDetail.findOne({
                                    where: {
                                        memberId: user.userId,
                                        isActive: true,
                                    },
                                    attributes: ['flatDetailId']
                                })

                                if (OwnerMemberFlat !== null) {
                                    flatIds.push(OwnerMemberFlat.flatDetailId);
                                }
                            }
                            const Flats = await FlatDetail.findAll({
                                where: {
                                    flatDetailId: {
                                        [Op.in]: flatIds
                                    },
                                    isActive: true,
                                },
                                include: [Tower, Floor]
                            })
                            user.flats = Flats;
                        }

                        if (user.roles[0].id === 4) {
                            const TenantFlats = await TenantFlatDetail.findAll({
                                where: {
                                    tenantId: user.userId,
                                    isActive: true,
                                },
                                attributes: ['flatDetailId']
                            })

                            if (TenantFlats.length !== 0) {
                                TenantFlats.map(item => {
                                    flatIds.push(item.flatDetailId);
                                })
                            }
                            else {
                                const TenantMemberFlat = await TenantMembersDetail.findOne({
                                    where: {
                                        memberId: user.userId,
                                        isActive: true,
                                    },
                                    attributes: ['flatDetailId']
                                })

                                if (TenantMemberFlat !== null) {
                                    flatIds.push(TenantMemberFlat.flatDetailId);
                                }
                            }
                            const Flats = await FlatDetail.findAll({
                                where: {
                                    flatDetailId: {
                                        [Op.in]: flatIds
                                    },
                                    isActive: true
                                },
                                include: [Tower, Floor]
                            })
                            user.flats = Flats;
                        }
                    }

                    if (user.roles.length === 2) {
                        if (user.roles[1].id === 3) {
                            const OwnerFlats = await OwnerFlatDetail.findAll({
                                where: {
                                    ownerId: user.userId,
                                    isActive: true,
                                },
                                attributes: ['flatDetailId']
                            })

                            if (OwnerFlats.length !== 0) {
                                OwnerFlats.map(item => {
                                    flatIds.push(item.flatDetailId);
                                })
                            }
                            else {
                                const OwnerMemberFlat = await OwnerMembersDetail.findOne({
                                    where: {
                                        memberId: user.userId,
                                        isActive: true,
                                    },
                                    attributes: ['flatDetailId']
                                })

                                if (OwnerMemberFlat !== null) {
                                    flatIds.push(OwnerMemberFlat.flatDetailId);
                                }
                            }
                            const Flats = await FlatDetail.findAll({
                                where: {
                                    flatDetailId: {
                                        [Op.in]: flatIds
                                    },
                                    isActive: true,
                                },
                                include: [Tower, Floor]
                            })
                            user.flats = Flats;
                        }

                        if (user.roles[1].id === 4) {
                            const TenantFlats = await TenantFlatDetail.findAll({
                                where: {
                                    tenantId: user.userId,
                                    isActive: true,
                                },
                                attributes: ['flatDetailId']
                            })

                            if (TenantFlats.length !== 0) {
                                TenantFlats.map(item => {
                                    flatIds.push(item.flatDetailId);
                                })
                            }
                            else {
                                const TenantMemberFlat = await TenantMembersDetail.findOne({
                                    where: {
                                        memberId: user.userId,
                                        isActive: true,
                                    },
                                    attributes: ['flatDetailId']
                                })

                                if (TenantMemberFlat !== null) {
                                    flatIds.push(TenantMemberFlat.flatDetailId);
                                }
                            }
                            const Flats = await FlatDetail.findAll({
                                where: {
                                    flatDetailId: {
                                        [Op.in]: flatIds
                                    },
                                    isActive: true,
                                },
                                include: [Tower, Floor]
                            })
                            user.flats = Flats;
                        }
                    }
                    return userData.push(user);
                }
            })
    },

    getUserSelectedFlat: async (id, flatDetailId, userData) => {
        await User.findOne({
            where: {
                userId: id,
                isActive: true
            },
            include: [
                {
                    model: Role,
                    where: {
                        id: { [Op.in]: [3, 4] }
                    }
                },
            ]
        })
            .then(async user => {
                if (user !== null) {
                    user = user.toJSON();
                    user.firstName = decrypt(user.firstName);
                    user.lastName = decrypt(user.lastName);
                    user.userName = decrypt(user.userName);
                    user.contact = decrypt(user.contact);
                    user.email = decrypt(user.email);
                    user.flatDisable = true;
                    const flatIds = [];
                    if (user.roles.length === 1) {
                        if (user.roles[0].id === 3) {
                            const OwnerFlats = await OwnerFlatDetail.findAll({
                                where: {
                                    ownerId: user.userId,
                                    isActive: true,
                                    flatDetailId: flatDetailId
                                },
                                attributes: ['flatDetailId']
                            })

                            if (OwnerFlats.length !== 0) {
                                OwnerFlats.map(item => {
                                    flatIds.push(item.flatDetailId);
                                })
                            }
                            else {
                                const OwnerMemberFlat = await OwnerMembersDetail.findOne({
                                    where: {
                                        memberId: user.userId,
                                        isActive: true,
                                        flatDetailId: flatDetailId
                                    },
                                    attributes: ['flatDetailId']
                                })

                                if (OwnerMemberFlat !== null) {
                                    flatIds.push(OwnerMemberFlat.flatDetailId);
                                }
                            }
                            const Flats = await FlatDetail.findAll({
                                where: {
                                    flatDetailId: {
                                        [Op.in]: flatIds
                                    },
                                    isActive: true,
                                },
                                include: [Tower, Floor]
                            })
                            user.flats = Flats;
                        }

                        if (user.roles[0].id === 4) {
                            const TenantFlats = await TenantFlatDetail.findAll({
                                where: {
                                    tenantId: user.userId,
                                    isActive: true,
                                    flatDetailId: flatDetailId
                                },
                                attributes: ['flatDetailId']
                            })

                            if (TenantFlats.length !== 0) {
                                TenantFlats.map(item => {
                                    flatIds.push(item.flatDetailId);
                                })
                            }
                            else {
                                const TenantMemberFlat = await TenantMembersDetail.findOne({
                                    where: {
                                        memberId: user.userId,
                                        isActive: true,
                                        flatDetailId: flatDetailId
                                    },
                                    attributes: ['flatDetailId']
                                })

                                if (TenantMemberFlat !== null) {
                                    flatIds.push(TenantMemberFlat.flatDetailId);
                                }
                            }
                            const Flats = await FlatDetail.findAll({
                                where: {
                                    flatDetailId: {
                                        [Op.in]: flatIds
                                    },
                                    isActive: true
                                },
                                include: [Tower, Floor]
                            })
                            user.flats = Flats;
                        }
                    }

                    if (user.roles.length === 2) {
                        if (user.roles[1].id === 3) {
                            const OwnerFlats = await OwnerFlatDetail.findAll({
                                where: {
                                    ownerId: user.userId,
                                    isActive: true,
                                    flatDetailId: flatDetailId
                                },
                                attributes: ['flatDetailId']
                            })

                            if (OwnerFlats.length !== 0) {
                                OwnerFlats.map(item => {
                                    flatIds.push(item.flatDetailId);
                                })
                            }
                            else {
                                const OwnerMemberFlat = await OwnerMembersDetail.findOne({
                                    where: {
                                        memberId: user.userId,
                                        isActive: true,
                                        flatDetailId: flatDetailId
                                    },
                                    attributes: ['flatDetailId']
                                })

                                if (OwnerMemberFlat !== null) {
                                    flatIds.push(OwnerMemberFlat.flatDetailId);
                                }
                            }
                            const Flats = await FlatDetail.findAll({
                                where: {
                                    flatDetailId: {
                                        [Op.in]: flatIds
                                    },
                                    isActive: true,
                                },
                                include: [Tower, Floor]
                            })
                            user.flats = Flats;
                        }

                        if (user.roles[1].id === 4) {
                            const TenantFlats = await TenantFlatDetail.findAll({
                                where: {
                                    tenantId: user.userId,
                                    isActive: true,
                                    flatDetailId: flatDetailId
                                },
                                attributes: ['flatDetailId']
                            })

                            if (TenantFlats.length !== 0) {
                                TenantFlats.map(item => {
                                    flatIds.push(item.flatDetailId);
                                })
                            }
                            else {
                                const TenantMemberFlat = await TenantMembersDetail.findOne({
                                    where: {
                                        memberId: user.userId,
                                        isActive: true,
                                        flatDetailId: flatDetailId
                                    },
                                    attributes: ['flatDetailId']
                                })

                                if (TenantMemberFlat !== null) {
                                    flatIds.push(TenantMemberFlat.flatDetailId);
                                }
                            }
                            const Flats = await FlatDetail.findAll({
                                where: {
                                    flatDetailId: {
                                        [Op.in]: flatIds
                                    },
                                    isActive: true,
                                },
                                include: [Tower, Floor]
                            })
                            user.flats = Flats;
                        }
                    }
                    return userData.push(user);
                }
            })
    },

    getIndividualVendorDetail: async (id) => {
       await IndividualVendor.findOne(
            {
                where: { individualVendorId: id, isActive: true },
                // order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: City,
                        attributes: ['cityId', 'cityName']
                    },
                    {
                        model: Country,
                        attributes: ['countryId', 'countryName']
                    },
                    {
                        model: State,
                        attributes: ['stateId', 'stateName']
                    },
                    {
                        model: Location,
                        attributes: ['locationId', 'locationName']
                    },
                    {
                        model: Service,
                        attributes: ['serviceId', 'serviceName']
                    },
                    {
                        model: RateType,
                        attributes: ['rateId', 'rateType']
                    },
                ]
            })
            .then(async vendor => {
                const rfid = await UserRFID.findOne({
                    where: {
                        userId: vendor.individualVendorId,
                        isActive: true
                    },
                    include: [
                        { model: RFID, where: { isActive: true }, attributes: ['rfidId', 'rfid'] }
                    ]
                });
                vendor.firstName = decrypt(vendor.firstName);
                vendor.lastName = decrypt(vendor.lastName);
                vendor.userName = decrypt(vendor.userName);
                vendor.contact = decrypt(vendor.contact);
                vendor.email = decrypt(vendor.email);
                vendor.permanentAddress = decrypt(vendor.permanentAddress);
                vendor.currentAddress = decrypt(vendor.currentAddress);
                vendor.rate = decrypt(vendor.rate);
                if (vendor.profilePicture !== null) {
                    vendor.profilePicture = decrypt(vendor.profilePicture);
                }
                vendor.documentOne = decrypt(vendor.documentOne);
                vendor.documentTwo = decrypt(vendor.documentTwo);
    
                vendor = vendor.toJSON();
    
                if (rfid !== null) {
                    vendor.rfid_master = {
                        rfidId: rfid.rfid_master.rfidId,
                        rfid: rfid.rfid_master.rfid
                    }
                }
                else {
                    vendor.rfid_master = rfid;
                }
    // console.log("<><>",vendor)
                return vendor;
            })
    }
}