module.exports = (sequelize, Sequelize) => {
	const Slots = sequelize.define('slot_master', {
	slotId:{
			type: Sequelize.INTEGER,
			autoIncrement:true,
			primaryKey:true
		},
	  slots: {
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
		},
		isAllocated: {
			type:Sequelize.BOOLEAN,
			defaultValue: false
		}
	},{
    freezeTableName: true
});
	
	return Slots;
}