module.exports = (sequelize, Sequelize) => {
    const ownerFlatDetail = sequelize.define('owner_flatDetail_master', {
        ownerFlatDetailId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
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

    return ownerFlatDetail;
}