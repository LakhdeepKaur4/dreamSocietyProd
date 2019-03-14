module.exports = (sequelize, Sequelize) => {
	const Designation = sequelize.define('designation_master', {
     designationId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
     designationName:{
        type:Sequelize.STRING, 
     },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
	});
	
	return Designation;
}