module.exports = (sequelize, Sequelize) => {
    const Video = sequelize.define('video_master', {
        videoId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        cameraId:{
            type: Sequelize.INTEGER,
        },
        videoName:{
            type: Sequelize.STRING,
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

    return Video;
}