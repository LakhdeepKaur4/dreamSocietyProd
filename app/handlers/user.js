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

module.exports = async function userData(id,userData) {
    console.log(id)
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
}
