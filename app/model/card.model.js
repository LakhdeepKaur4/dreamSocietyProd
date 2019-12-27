module.exports = (sequelize, Sequelize) => {
  const Card = sequelize.define(
    "card_master",
    {
      cardId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      number: {
        type: Sequelize.STRING,
        required: true,
        maxlength: 16,
        unique:true
      },
      holder: {
        type: Sequelize.STRING,
        trim: true,
        required: true
      },
      expiration: {
        type: Sequelize.STRING
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

  return Card;
};
