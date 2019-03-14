module.exports = (sequelize, Sequelize) => {
	const Society = sequelize.define('society_master', {
		societyId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		societyName: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		societyAddress: {
            type: Sequelize.STRING
		},
	    contactNumber: {
			type: Sequelize.STRING,
			allowNull: false,
        },
        registrationNumber: {
			type: Sequelize.STRING,
			allowNull: false,
        },
        totalBoardMembers: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		bankName: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		accountHolderName: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		accountNumber: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		email: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		IFSCCode: {
			type: Sequelize.STRING,
		},
		isActive: {
			type: Sequelize.BOOLEAN,
			defaultValue: true
		},
		createdAt: {
            type: Sequelize.DATE
        },
        updatedAt: {
            defaultValue: null,
            type: Sequelize.DATE
        }
	}, {
		freezeTableName: true
	});

	return Society;
}