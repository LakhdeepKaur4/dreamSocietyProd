module.exports = (sequelize, Sequelize) => {
	const Assets = sequelize.define('asset_master', {
	assetId:{
			type: Sequelize.INTEGER,
			autoIncrement:true,
			primaryKey:true
		},
	  assetName: {
		  type: Sequelize.STRING
      },
      description:{
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
	
	return Assets;
}