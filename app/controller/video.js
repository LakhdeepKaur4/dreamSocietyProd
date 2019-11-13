const httpStatus = require('http-status');
const path = require('path');
const fs = require('fs');
const db = require('../config/db.config.js');
const UserVideo = db.userVideo;
const Video = db.video;
const User = db.user;

exports.addVideo = async (req, res, next) => {
  let transaction;
  try {
    transaction = await db.sequelize.transaction();
    const body = req.body;
    // body.videoId = body.userId;
    const video = await UserVideo.create(body, transaction);
    await transaction.commit();
    return res.status(httpStatus.CREATED).json({
      message: "Video successfully created",
      video
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error.message);
  }
}

// exports.getlivevideo = async (req, res, next) => {
//     try {
//         let pathFile = `../../public/video/${req.userId}.mp4`;
//         // index = pathFile.lastIndexOf('/');
//         // console.log("index--",index);
//         // actualpath =  pathFile.slice(0, index);
//         // fileExt = pathFile.lastIndexOf('.');
//         // const userId = pathFile.slice(index+1,fileExt);
//         // console.log(userId)
//         let fileName = path.join(__dirname, pathFile);
//         const streamedVideo = fs.createReadStream(fileName);
//         streamedVideo.pipe(res.status(httpStatus.OK).json({ message: 'Getting videos' }))
//     } catch (error) {
//         console.log(error)
//         res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
//     }
// }     

exports.getAllVideoOfUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    console.log(userId)
    // const video = await UserVideo.findAll({where:{userId:userId}});
    const user = await User.findAll({
      where: { isActive: true },
      attributes: ['userId', 'userName'],
      include: [{
        model: Video,
        as: 'Video',
        attributes: ['videoId', 'videoName'],
        through: {
          attributes: ['videoId', 'videoName'],
        }
      }
      ]
      , order: [['createdAt', 'DESC']]
    });
    const filteredData = user.filter(data => {
      if (data.userId == req.userId) {
        return data;
      }
    })
    res.status(httpStatus.OK).json({ videoData: filteredData });
  } catch (error) {
    console.log(error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error.message);
  }
}

exports.getlivevideo = async (req, res, next) => {
  try {
    const pathFile = `../../public/video/${req.params.videoId}.mp4`
    let fileName = path.join(__dirname, pathFile);
    const stat = fs.statSync(fileName);
    const fileSize = stat.size
    const range = req.headers.range
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1]
        ? parseInt(parts[1], 10)
        : fileSize - 1
      const chunksize = (end - start) + 1
      const file = fs.createReadStream(fileName, { start, end })
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      }
      res.status(httpStatus.OK).writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        message: 'Getting video'
      }
      res.writeHead(200, head);
      fs.createReadStream(fileName).pipe(res)
    }
  } catch (error) {
    console.log(error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error.message);
  }
}