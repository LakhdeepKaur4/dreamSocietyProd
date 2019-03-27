module.exports = (sequelize, Sequelize) => {
	const Inventory = sequelize.define('inventory_master', {
	  inventoryId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      serialNumber:{
        type: Sequelize.STRING,
      },
      autoGenerate:{
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },  
      dateOfPurchase:{
        type: Sequelize.DATEONLY,
      }, 
      rate:{
        type:Sequelize.FLOAT,
        defaultValue: true
      }, 
      number:{
        type:Sequelize.INTEGER,
        defaultValue: true
      }, 
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
	});
	
	return Inventory;
}