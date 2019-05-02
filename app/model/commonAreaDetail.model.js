module.exports = (sequelize, Sequelize) => {
    const CommonAreaDetail = sequelize.define('common_area_detail_master', {
        commonAreaDetailId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
        updatedAt: {
            defaultValue: null,
            type: Sequelize.DATE
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        }
    }, {
            freezeTableName: true
        });

    return CommonAreaDetail;
}