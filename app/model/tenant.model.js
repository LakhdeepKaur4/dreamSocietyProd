

module.exports = (sequelize, Sequelize) => {
      const Tenant = sequelize.define('tenant_master', {
            tenantId: {
                  type: Sequelize.INTEGER,
                  autoIncrement: true,
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
                  type: Sequelize.DATEONLY,
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
            password: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            picture: {
                  type: Sequelize.STRING,
            },
            permanentAddress: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            correspondenceAddress: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            bankName: {
                  type: Sequelize.STRING,
                  // allowNull: false
            },
            accountHolderName: {
                  type: Sequelize.STRING,
                  // allowNull: false
            },
            accountNumber: {
                  type: Sequelize.STRING,
                  // allowNull: false
            },
            gender: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            panCardNumber: {
                  type: Sequelize.STRING,
                  allowNull: false
            },
            IFSCCode: {
                  type: Sequelize.STRING,
                  // allowNull: false
            },
            noOfMembers: {
                  type: Sequelize.INTEGER,
                  allowNull: false
            },
            aadhaarNumber: {
                  type: Sequelize.STRING,
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

      return Tenant;
}