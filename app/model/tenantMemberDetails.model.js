module.exports = (sequelize, Sequelize) => {
    const TenantMembersDetail = sequelize.define('tenant_members_detail_master', {
        memberId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        memberName: {
            type: Sequelize.STRING,
            allowNull:false
        },
        memberDob: {
            type: Sequelize.DATEONLY,
            allowNull:false
        },
        gender: {
            type: Sequelize.STRING,
            allowNull: false
      },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
        updatedAt: {
            defaultValue: null,
            type: Sequelize.DATE
        }
    }, {
            freezeTableName: true
        });

    return TenantMembersDetail;
}