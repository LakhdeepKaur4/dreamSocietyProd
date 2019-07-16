const db = require('../config/db.config.js');
const httpStatus = require('http-status');

const VendorAllotment = db.vendorAllotment;
const IndividualVendor = db.individualVendor;
const User = db.user;

exports.get = async (req, res, next) => {
    try {
        // let slotArray = [];
        // const alreadyBooked = 
        const vendorslot = await VendorAllotment.findAll({
            where: { isActive: true,booked:false},
            // attributes:{exclude:[]},
            include: [{
                model: IndividualVendor,
                as: 'Vendor',
                attributes: ['firstName', 'lastName', 'userName', 'contact', 'email']
            }],
        });
        vendorslot.map(item => {
            item.Vendor.firstName = decrypt(item.Vendor.firstName);
            item.Vendor.lastName = decrypt(item.Vendor.lastName);
            item.Vendor.userName = decrypt(item.Vendor.userName);
            item.Vendor.contact = decrypt(item.Vendor.contact);
            item.Vendor.email = decrypt(item.Vendor.email);
        })
        // slotArray['individualVendorId'] = vendorslot[0].individualVendorId;
        // if (vendorslot.length == 1) {
        //     let slot1startTime = vendorslot[0].startTime;
        //     let slot1endTime = vendorslot[0].endTime;
        //     slotArray.push({ slot1startTime, slot1endTime })
        // }
        // else if (vendorslot.length == 2) {
        //     let slot1startTime = vendorslot[0].startTime;
        //     let slot1endTime = vendorslot[0].endTime;
        //     let slot2startTime = vendorslot[1].startTime;
        //     let slot2endTime = vendorslot[1].endTime;
        //     slotArray.push({ slot1startTime, slot1endTime, slot2startTime, slot2endTime });
        // }
        // else {
        //     let slot1startTime = vendorslot[0].startTime;
        //     let slot1endTime = vendorslot[0].endTime;
        //     let slot2startTime = vendorslot[1].startTime;
        //     let slot2endTime = vendorslot[1].endTime;
        //     let slot3startTime = vendorslot[1].startTime;
        //     let slot3endTime = vendorslot[1].endTime;
        //     slotArray.push({ slot1startTime, slot1endTime, slot2startTime, slot2endTime, slot3startTime, slot3endTimeslot3startTime, slot3endTime });
        // }
        // console.log(slotArray.length)
        return res.status(httpStatus.OK).json({
            message: "Vendor Slot Available",
            vendorslot
        });
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.bookVendorSlot = async(req,res,next) =>{
    try{
    const vendorAllotment = await VendorAllotment.find({where:{isActive:true,booked:false,vendorAllotmentId:req.params.id}});
    if(vendorAllotment){
        VendorAllotment.update({ booked: true ,bookedBy:req.userId,userId:req.userId}, { where: { vendorAllotmentId: req.params.id, isActive: true } });
        return res.status(httpStatus.OK).json({
            message: "Slot booked successfully",
        });
    }
    }catch(error){
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error); 
    }
}


