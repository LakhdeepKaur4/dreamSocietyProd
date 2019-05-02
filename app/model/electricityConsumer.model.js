module.exports = (sequelize, Sequelize) => {
  const ElectricityConsumer = sequelize.define('electricity_consumer_master', {
    electricityConsumerId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    startDate: {
      type: Sequelize.DATEONLY,
    },
    endDate: {
      type: Sequelize.DATEONLY,
    },
    Usage:{
      type: Sequelize.INTEGER,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    totalConsumption:{
      type: Sequelize.FLOAT,
    }
  });

  return ElectricityConsumer;
}