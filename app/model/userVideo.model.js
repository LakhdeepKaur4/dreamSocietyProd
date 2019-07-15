module.exports = (sequelize, Sequelize) => {
	const UserVideo = sequelize.define('user_video_master', {
		userVideoId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
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
	}, {
		freezeTableName: true
	});

	return UserVideo;
}