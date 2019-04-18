module.exports = (sequelize, Sequelize) => {
    const MachineDetail = sequelize.define('machine_detail_master', {
        machineDetailId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        machineActualId: {
            type: Sequelize.STRING,
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

    return MachineDetail;
}