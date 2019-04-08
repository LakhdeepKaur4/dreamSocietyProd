module.exports = (sequelize, Sequelize) => {
	const Complaint = sequelize.define('complaint_master', {
        complaintId:{
			type: Sequelize.INTEGER,
			autoIncrement:true,
			primaryKey:true
		},
		isActive:{
			type:Sequelize.BOOLEAN,
			defaultValue: true
        }, 
        complaintTime:{
          type:Sequelize.TIME
        },
        isAccepted:{
            type:Sequelize.BOOLEAN
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
	
	return Complaint;
}