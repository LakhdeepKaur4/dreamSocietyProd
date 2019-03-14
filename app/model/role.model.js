module.exports = (sequelize, Sequelize) => {
	const Role = sequelize.define('roles', {
	  roleName: {
		  type: Sequelize.STRING
	  }
	});
	
	return Role;
}