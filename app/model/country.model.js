module.exports = (sequelize, Sequelize) => {
	const Country = sequelize.define('country_master', {
	  countryId:{
			type: Sequelize.INTEGER,
			autoIncrement:true,
			primaryKey:true
		},
	  countryName: {
			type: Sequelize.STRING,
			unique:'compositeIndex'
		},
		code: {
		  type: Sequelize.STRING
		},
		currency:{
			type: Sequelize.STRING
		},
		phoneCode:{
			type: Sequelize.STRING
		},
		isActive:{
			type:Sequelize.BOOLEAN,
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
	},{
    freezeTableName: true
});
	
	return Country;
}