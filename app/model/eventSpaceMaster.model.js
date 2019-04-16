module.exports = (sequelize, Sequelize) => {
  const EventSpace = sequelize.define(
    "event_space_master",
    {
      eventSpaceId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      spaceName: {
        type: Sequelize.STRING
      },
      capacity: {
        type: Sequelize.INTEGER
      },
      spaceType: {
        type: Sequelize.STRING
      },
      area: {
        type: Sequelize.INTEGER
      },
      description: {
        type: Sequelize.STRING
      },
      from :{
        type: Sequelize.DATEONLY
      },
      to :{
        type: Sequelize.DATEONLY
      },
      price :{
        type: Sequelize.FLOAT
      },
      isActive: {
        type: Sequelize.BOOLEAN,
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
    },
    {
      freezeTableName: true
    }
  );

  return EventSpace;
};
