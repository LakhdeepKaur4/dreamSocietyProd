module.exports = (sequelize, Sequelize) => {

    const PurchaseOrder = sequelize.define('purchaseOrder_master', {
        purchaseOrderId: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true
        },
        issuedBy: {
            type: Sequelize.STRING,
        },
        expDateOfDelievery: {
            type: Sequelize.STRING,
            allowNull: false
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
      },
        
  }, {
              freezeTableName: true
        });

  return PurchaseOrder;
}
