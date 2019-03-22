module.exports = (sequelize, Sequelize) => {
      const Owner = sequelize.define('owner_master', {
            ownerId: {
                  type: Sequelize.INTEGER,
                  autoIncrement: true,
                  primaryKey: true
            },
            ownerName: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            userName: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            dob: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            email: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            contact: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            // aadharCardNumber: {
            //       type: Sequelize.STRING,
            //       allowNull: false
            // },
            password: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            picture: {
                  type: Sequelize.STRING,
            },
            gender: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            permanentAddress: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            bankName: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            accountHolderName: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            accountNumber: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            panCardNumber: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            IFSCCode: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            adhaarCardNo:{
                  type: Sequelize.STRING,
                  allowNull: false
            },
            noOfMembers: {
                  type: Sequelize.INTEGER,
                  allowNull: false
            },
            isActive: {
                  type: Sequelize.BOOLEAN,
                  defaultValue: false
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

      return Owner;
}