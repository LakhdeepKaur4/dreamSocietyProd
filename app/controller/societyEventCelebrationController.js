const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');
const Razorpay = require('razorpay');
const Order = db.order;


const razorpay = new Razorpay({
    key_id: config.RAZORPAY_API_KEY,
    key_secret: config.RAZORPAY_API_SECRET,
})
exports.create = async (req, res) => {

    try{
        console.log("CREATE ORDER: ", req.body);
        if(req.body.interested){
            req.body.userId = req.userId;
    //generating random number for receipt
    const receiptRandomNumber = Math.floor(Math.random() * 90000) + 10000;
    //object to be send to razorpay
    console.log("amount",req.body.totalCharges)
    var orderData = {
        amount: req.body.totalCharges*100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: `order_rcptid_${receiptRandomNumber}`,
        payment_capture: '1'
    };
    //calling razorpay order api
    const response = await razorpay.orders.create(orderData);
    console.log("rrrrrrrrrrrrrrrrrrrr",response) 
    req.body.razorpay_id = response.id;
    req.body.receipt = response.receipt;
    req.body.entity = response.entity;
    req.body.currency = response.currency;
    req.body.razorpay_status = response.status;
    req.body.attempts = response.attempts;
    req.body.razorpay_createdAt = response.createdAt;
    const body = req.body;
    const order = await Order.create(body);
    if(order){
        return res.status(httpStatus.CREATED).json({message:'order successfully created',order,body});
    }
   }else{
    res.status(httpStatus.UNPROCESSABLE_ENTITY).json({message:'Please Select valid Input'})
   }
    
    }catch(err){
        console.log("errrrrrr======>",err)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err.message)
    }
    
        
    
};