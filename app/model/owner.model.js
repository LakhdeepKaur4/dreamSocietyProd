module.exports = (sequelize, Sequelize) => {
      const Owner = sequelize.define('owner_master', {
            ownerId: {
                  type: Sequelize.INTEGER,
                  // autoIncrement: true,
                  primaryKey: true
            },
            firstName: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            lastName: {
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
                  type: Sequelize.STRING(2000),
                  allowNull: false
            },
            correspondenceAddress: {
                  type: Sequelize.STRING(2000),
                  allowNull: false
            },
            bankName: {
                  type: Sequelize.STRING
            },
            accountHolderName: {
                  type: Sequelize.STRING
            },
            accountNumber: {
                  type: Sequelize.STRING
            },
            panCardNumber: {
                  type: Sequelize.STRING
            },
            IFSCCode: {
                  type: Sequelize.STRING
            },
            adhaarCardNo: {
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