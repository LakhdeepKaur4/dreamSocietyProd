const { cardValidator } = require('../handlers/cardValidator');
const httpStatus = require('http-status');
const db = require("../config/db.config");
const Card = db.cardDetails;
const crypto = require('crypto');
const config = require('../config/config')
// API to check whether card is valid or not 
exports.checkValidCardNumber = async (req, res, next) => {
    try {
        const body = req.body;
        console.log(body)
        if (!body.number && body.number == '') {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: 'Fields missing' })
        }
        const resp = cardValidator(req.body);
        if (body.checkCard) {
            if (resp.validCardNumber) {
                return res.status(httpStatus.OK).json({ response: resp });
            } else {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ response: "Please enter valid card details" })
            }
        } else {
            console.log(resp)
            if (resp.validCardNumber && resp.validExpiration) {
                return res.status(httpStatus.OK).json({ response: resp });
            } else {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ response: "Please enter date in MM/DD format" })
            }
        }

    } catch (error) {
        console.log(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error)
    }
}

// API to save card data
exports.saveCardData = async (req, res, next) => {
    try {
        const body = req.body;
        
        if (!body.number && !body.expiration && body.holder) {
            res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: 'Fields missing' })
        }
        body.userId = req.userId;
        const card = await Card.create(body);
        
        if(card){
            
            return res.status(httpStatus.CREATED).json(card);
        }else{
            
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: "Error in saving card detail"
                });
        }
       } catch (error) {
           console.log(":;;;:",error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error.message)
    }
}

// API to get card data
exports.listCard = async(req, res) => {
    try{
        const card  = await Card.findAll({where:{ userId: req.userId, isActive: true}, order: [['createdAt']]})
        
            if (card) {
                res.status(httpStatus.OK).json({message:"All user cards",card})
            }
            else{
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: "Error in getting card detail"
                });;
            }
    }catch(err){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err.message)
    }
    
        
};

// API to update card data
exports.updateCard = (req, res) => {
    Order.update(
        { _id: req.body.orderId },
        { $set: req.body },
        (err, card) => {
            if (err) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: "Error in updating card detail"
                });
            }
            res.status(httpStatus.OK).json({ message: "Card updated successfully" });
        }
    );
};


// API to delete existing card data
exports.deleteCard = (req, res) => {
    Card.update(
        { _id: req.params.cardId },
        { $set: { isActive: false } },
        (err, card) => {
            if (err) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: "Error in deleting card detail"
                });
            }
            res.status(httpStatus.OK).json({ message: "Card deleted successfully" });
        }
    );
}



exports.saveTransaction = async (req, res) => {
    console.log("CREATE Transaction: ", req.body);
    const data = req.body;
   
        const generated_signature = data.razorpay_order_id + "|" + data.razorpay_payment_id;
        // const gs = cryptojs.SHA256(generated_signature,config.RAZORPAY_API_SECRET);
        // console.log("****", gs);
        console.log("****", data.razorpay_signature);
        // generated_signature = hmac_sha256(data.razorpay_order_id + "|" + data.razorpay_payment_id+','+ config.RAZORPAY_API_SECRET);
       const gs=crypto.createHmac('sha256', config.RAZORPAY_API_SECRET).update(generated_signature).digest('hex');
        if (gs == data.razorpay_signature) {
            console.log("Payment done");
            res.status(httpStatus.OK).json({ data, message: "Payment successfully done" })
        } else {
            console.log("Payment Failed");
            res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ data, message: "Payment Failed" })
        }
    };




