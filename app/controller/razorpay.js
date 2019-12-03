const Razorpay = require('razorpay');
const httpStatus = require('http-status');
require("dotenv").config();
var request = require('request');

// var razorpay = new Razorpay({
//     key_id: rzp_test_DUi6OPmtPxMldq,
//     key_secret: process.env.RAZORPAY_API_SECRET,
// });
// console.log(razorpay);

exports.getCardAssociatedWithAccount = async (req, res, next) => {
    try {
        request({
            method: 'GET',
            url: `https://api.razorpay.com/v1/preferences?key_id=rzp_test_DUi6OPmtPxMldq&currency%5B0%5D=INR&checkcookie=1`
        }, function (error, response, body) {
            res.status(httpStatus.OK).send(body);
        });
    } catch (error) {
        console.log(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error)
    }
}

exports.Order = async (req, res, next) => {
    try {
        var options = {
            amount: 10000,  // amount in the smallest currency unit
            currency: "INR",
            receipt: "order_rcptid_11",
            payment_capture: '1'
        };
        instance.orders.create(options, function (err, order) {
            console.log(order);
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error)
    }
}
//Testing API for creating order and getting razorpay orderId in response
exports.createOrder = async (req, res, next) => {
    try {
        var options = {
            amount: 10000,  // amount in the smallest currency unit
            currency: "INR",
            receipt: "order_rcptid_11",
            payment_capture: 1
        };
        const order = await razorpay.orders.create(options);
        res.status(httpStatus.OK).send(order);
    } catch (error) {
        res.send(httpStatus.INTERNAL_SERVER_ERROR).send(error)
    }
}

//Testing API for fetching paymentId based on razorpay order id
exports.fetchPaymentIdForOrder = async (req, res, next) => {
    try {
        request({
            method: 'POST',
            url: `https://api.razorpay.com/v1/checkout/embedded`
        }, function (error, response, body) {
            console.log('Status:', response.statusCode);
            console.log('Headers:', JSON.stringify(response.headers));
            console.log('Response:', body);
            res.status(httpStatus.OK).send(body);
        });
        // let payments = await razorpay.orders.fetchPayments({
        //     amount: 10000,
        //     currency: 'INR',
        //     order_id: 'order_DV7Ri6HRtsFkNg',
        //     // notes: data['notes'],
        // });
        // console.log(payments);
        // res.send(payments)
    } catch (error) {
        console.log("=======>",error)
        // res.send(httpStatus.INTERNAL_SERVER_ERROR).send(error)
    }
}


//Testing API for making payment
exports.payment = async (req, res, next) => {
    try {
        console.log("**")
        // razorpay.payments.capture('order_DV8fzCUiNKosLp', parseInt('10000'))
        //     .then(function (response) {
        //         res.send(response);
        //     })
        //     .catch(function (err) {
        //         console.error(err);
        //         res.status(500).send(err);
        //     });
        // Copyvar request = require('request');
        let paymentId = "pay_DVWFHFz6EqQEUg";
        request({
            method: 'POST',
            url: `https://${process.env.RAZORPAY_API_KEY}:${process.env.RAZORPAY_API_SECRET}@api.razorpay.com/v1/payments/${paymentId}/capture`,
            form: {
                amount: 5000
            }
        }, function (error, response, body) {
            console.log('Status:', response.statusCode);
            console.log('Headers:', JSON.stringify(response.headers));
            console.log('Response:', body);
        });
    } catch (error) {
        res.send(httpStatus.INTERNAL_SERVER_ERROR).send(error)
    }
}


exports.finalApi = async (req, res, next) => {
    try {
        let output;
        var data = {
            amount: 10000,  // amount in the smallest currency unit
            currency: "INR",
            receipt: "order_rcptid_11",
            payment_capture: 0
        };
        await razorpay.orders.create({
            amount: data['amount'],
            currency: data['currency'],
            receipt: data['receipt'],
            payment_capture: data['payment_capture'],
            notes: data['notes']
        }).then(async (result) => {
            output = result;
            // let payments = await razorpay.orders.fetchPayments({
            //     amount: data['amount'],
            //     currency: data['currency'],
            //     order_id:String(result.id),
            //     notes: data['notes'],
            // });
            console.log(result.id)
            let payments = await razorpay.orders.fetchPayments(result.id)
            console.log(payments);
            res.send(payments)
        }).catch((error) => {
            output = data;
            console.log("**", error)
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error.message)
    }
}


exports.createPayment = async (req, res, next) => {
    try {
        // const payment = await razorpay.createPayment({
        //     amount: 5000,
        //     email: 'gaurav.kumar@example.com',
        //     contact: '9123456780',
        //     order_id: 'order_9A33XWu170gUtm',
        //     method: 'card',
        //     'card[name]': 'Gaurav Kumar',
        //     'card[number]': '4111111111111111',
        //     'card[cvv]': '566',
        //     'card[expiry_month]': '10',
        //     'card[expiry_year]': '20'
        // });
        // res.send(payment)
        const fetchpayment = await razorpay.orders.fetchPayments('order_9A33XWu170gUtm');
        console.log(fetchpayment)
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error.message)
    }
}

