module.exports = (sequelize, Sequelize) => {
	const Parking = sequelize.define('parking_master', {
	parkingId:{
			type: Sequelize.INTEGER,
			autoIncrement:true,
			primaryKey:true
		},
	  parkingName: {
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
	
	return Parking;
}