module.exports = (sequelize, Sequelize) => {
    const PurchaseOrderDetails = sequelize.define('purchaseOrderDetails_master', {
          purchaseOrderDetailId: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
          },
            purchaseOrderType:{
                  type:Sequelize.STRING,
                  allowNull:false
            },
            purchaseOrderName:{
                  type:Sequelize.STRING,
                  allowNull:false
            },
          rate: {
                type: Sequelize.INTEGER,
                allowNull: false
          },
          quantity: {
                type: Sequelize.INTEGER,
                allowNull: false
          },
          amount: {
                type: Sequelize.INTEGER,
                allowNull: false
          },
          serviceStartDate: {
                type: Sequelize.STRING,
                allowNull: true
          },
          // aadharCardNumber: {
          //       type: Sequelize.STRING,
          //       allowNull: false
          // },
          serviceEndDate: {
                type: Sequelize.STRING,
                allowNull: true
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

    return PurchaseOrderDetails;
}