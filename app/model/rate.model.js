module.exports = (sequelize, Sequelize) => {
	const Rate = sequelize.define('rate_master', {
	  rateId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      rateType:{
        type: Sequelize.STRING,
      },
      isActive:{
        type:Sequelize.BOOLEAN,
        defaultValue: true
      }, 
	});
	
	return Rate;
}