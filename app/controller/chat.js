const httpStatus = require('http-status');
const Chatkit = require('@pusher/chatkit-server');
const config = require('../config/config.js');

const chatkit = new Chatkit.default({
    instanceLocator: config.instanceLocator,
    key: config.key
})

exports.createUserOnChatKit = async (req, res, next) => {
    try {
        const { username } = req.body;
        chatkit.createUser({ name: username, id: username })
            .then(() => {
                res.status(httpStatus.CREATED).json({ message: "User created successfully" })
            }).catch((err) => {
                if (err.error_type === 'services/chatkit/user/user_already_exists') {
                    res.status(httpStatus.UNPROCESSABLE_ENTITY).json(err)
                } else {
                    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
                }
            });
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getAllUserFromChatKit = async (req, res, next) => {
    try {
        chatkit.getUsers()
            .then(user => res.status(httpStatus.OK).json({ message: "User content page", user }))
            .catch(err => res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err))
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getByUserIdFromChatKit = async (req, res, next) => {
    try {
        chatkit.getUser({
            id: req.params.id,
        })   
            .then(user => res.status(httpStatus.OK).json({ message: "User content page", user }))
            .catch(err => res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err))
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.authByChatKit = async (req, res, next) => {
    try {
        const grant_type =req.body;
        console.log(grant_type);
        console.log(req.query.user_id);
        const authData = await chatkit.authenticate(
            {grant_type,userId:req.query.user_id}
        );
        res.status(authData.status).json(authData.body);
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


