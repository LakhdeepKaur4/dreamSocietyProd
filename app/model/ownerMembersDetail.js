module.exports = (sequelize, Sequelize) => {
    const OwnerMembersDetail = sequelize.define('owner_members_detail_master', {
        memberId: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        memberFirstName: {
            type: Sequelize.STRING,
            allowNull:false
        },
        memberLastName: {
            type: Sequelize.STRING,
            allowNull:false
        },
        memberUserName: {
            type: Sequelize.STRING,
            allowNull: false
      },
        memberDob: {
            type: Sequelize.STRING,
            allowNull:false
        },
        gender: {
            type: Sequelize.STRING,
            // allowNull: false
      },
      memberEmail: {
        type: Sequelize.STRING,
        allowNull: false
    },
        memberContact: {
                type: Sequelize.STRING,
                allowNull: false
        },
        password: {
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

    return OwnerMembersDetail;
}