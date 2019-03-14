module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define('user_master', {
		userId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		firstName: {
			type: Sequelize.STRING
		},
		lastName: {
			type: Sequelize.STRING
		},
		userName: {
			type: Sequelize.STRING,
			unique: 'compositeIndex'
		},
		contact: {
			type: Sequelize.STRING,
			unique: true
		},
		email: {
			type: Sequelize.STRING,
			unique: true
		},
		password: {
			type: Sequelize.STRING
		},
		familyMember: {
			type: Sequelize.STRING
		},
		parking: {
			type: Sequelize.STRING
		},
		floor: {
			type: Sequelize.STRING
		},
		QRCode:{
			type:Sequelize.STRING,
			defaultValue: "QRCODE"
			
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

	return User;
}