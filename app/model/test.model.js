var EncryptedField = require('sequelize-encrypted');
const config = require('../config/config.js');
const Sequelize = require('sequelize');
const key = config.secret;
const enc_fields = EncryptedField(Sequelize, key);
module.exports = (sequelize, Sequelize) => {
	const Test = sequelize.define('test', {
		
		name: {
			type: Sequelize.STRING
		},
	    address:{
            type: Sequelize.STRING
		},
		QRCode:{
			type:Sequelize.STRING
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
	// var user = User.build();
	// user.private_1 = 'test';
	return Test;
}