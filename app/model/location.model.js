module.exports = (sequelize, Sequelize) => {
	const Location = sequelize.define('location_master', {
		locationId:{
			type: Sequelize.INTEGER,
			autoIncrement:true,
			primaryKey:true
		},
	  locationName: {
		  type: Sequelize.STRING,
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
	
	return Location;
}