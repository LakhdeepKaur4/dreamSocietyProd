const httpStatus = require("http-status");
const Nexmo = require("nexmo");
const config = require('../config/config.js');

const nexmo = new Nexmo(
    {
      apiKey: config.api_key,
      apiSecret: config.api_secret
    },
    { debug: true }
  );


  exports.sendMessage = async(req,res,next) => {
      try{
        let data= {};
        const to = req.body.to;
        const message = req.body.message;
        nexmo.message.sendSms(config.number, to, message,{ type: "unicode" },(error,response)=>{
            if(error){
                data = { error: error };
               return res.json(data)
            }
            if (response.messages[0]["error-text"]) {
            data = { error: response.messages[0]["error-text"] };
            return res.json(data);
            }else{
            let n =response.messages[0]["to"].substr(0,response.messages[0]["to"].length - 4) + "****";
            data = {
            id: response.messages[0]["message-id"],
            message: "Confirmation message has been sent to " + n
          };
          res.status(httpStatus.OK).json({message:"Your message has been successfully sent",data,number:n});
        }
        });
       
      }catch(error){
          res.send(httpStatus.INTERNAL_SERVER_ERROR).json({error:error})
      }
  }

  // exports.sendSMS = async(req,res,next) => {
  //   try{
  //   const options = {
  //     url:config.url,
  //   };


  //   }catch(error){
  //     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({error:error})
  //   }
  // }

//   var request = require("request");

// var options = { method: 'POST',
//   url: 'https://www.smsgateway.center/SMSApi/rest/send',
//   headers: 
//    { 'cache-control': 'no-cache',
//      'content-type': 'application/x-www-form-urlencoded' },
//   form: 
//    { userId:config.userId,
//      password: config.password,
//      senderId: config.senderId,
//      sendMethod: 'simpleMsg',
//      msgType: 'text',
//      mobile: '7053282382',
//      msg: 'This is my first message with SMSGateway.Center',
//      duplicateCheck: 'true',
//      format: 'json' } };

// request(options, function (error, response, body) {
//   if (error) throw new Error(error);
// // console.log("response===>",response)
//   console.log(body);
// });