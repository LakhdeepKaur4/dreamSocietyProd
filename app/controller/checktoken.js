const db = require("../config/db.config.js");
const config = require("../config/config.js");
const httpStatus = require("http-status");
var passwordGenerator = require("generate-password");
const key = config.secret;
const fs = require("fs");
const http = require('http');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const mailjet = require('node-mailjet').connect('5549b15ca6faa8d83f6a5748002921aa', '68afe5aeee2b5f9bbabf2489f2e8ade2');


const Owner = db.owner;
const Tenant = db.tenant;
const Vendor = db.vendor;
const Employee = db.employee;
const IndividualVendor = db.individualVendor;

const Otp = db.otp;


function decrypt(key, data) {
    var decipher = crypto.createDecipher("aes-128-cbc", key);
    var decrypted = decipher.update(data, "hex", "utf-8");
    decrypted += decipher.final("utf-8");

    return decrypted;
}

function decrypt1(key, data) {
    var decipher = crypto.createDecipher("aes-128-cbc", key);
    var decrypted = decipher.update(data, "hex", "utf-8");
    decrypted += decipher.final("utf-8");

    return decrypted;
}


let testSms = (contact) => {
    const apikey = '07hlECj1sy4-ynODCNlExLsx91Pv29Zdrh0bxc1pLc';
    const number = contact;
    const OTP = Math.floor(100000 + Math.random() * 900000);
    const message = 'Your one time password is ' + OTP + ".Please enter this otp to verify,it will valid for 5 minutes. Don't share with anyone ";

    http.get(`http://api.textlocal.in/send/?apiKey=${apikey}&numbers=${number}&message=${message}`, function (err, data) {
        console.log('messageSend');

    });
    return OTP;

};


exports.checkToken = async (req, res, next) => {
    if (req.query.ownerId) {
        let ownerId = decrypt(key, req.query.ownerId);
        let owner = await Owner.findOne({ where: { ownerId: ownerId, isActive: true } });
        if (owner) {
            return res.status(200).json(
                {
                    alreadyActivated: true,
                    tokenVerified: false,
                    message: 'you are already activated. check your email for userName and password.'
                });
        }
    }

    if (req.query.employeeId) {
        let employeeId = decrypt1(key, req.query.employeeId);
        let employee = await Employee.findOne({ where: { employeeId: employeeId, isActive: true } });
        if (employee) {
            return res.status(200).json(
                {
                    alreadyActivated: true,
                    tokenVerified: false,
                    message: 'You are already activated.Check your email for userName and password.'
                });
        }
    }

    if (req.query.vendorId) {
        let vendorId = decrypt(key, req.query.vendorId);
        let vendor = await Vendor.findOne({ where: { vendorId: vendorId, isActive: true } });
        if (vendor) {
            return res.status(200).json(
                {
                    alreadyActivated: true,
                    tokenVerified: false,
                    message: 'You are already activated. Check your email for userName and password.'
                });
        }
    }

    if (req.query.tenantId) {
        let tenantId = decrypt1(key, req.query.tenantId);
        let tenant = await Tenant.findOne({ where: { tenantId: tenantId, isActive: true } });
        if (tenant) {
            return res.status(200).json(
                {
                    alreadyActivated: true,
                    tokenVerified: false,
                    message: 'You are already activated. Check your email for userName and password.'
                });
        }
    }

    if (req.query.individualVendorId) {
        let individualVendorId = decrypt1(key, req.query.individualVendorId);
        let individualVendor = await IndividualVendor.findOne({ where: { individualVendorId: individualVendorId, isActive: true } });
        if (individualVendor) {
            return res.status(200).json(
                {
                    alreadyActivated: true,
                    tokenVerified: false,
                    message: 'You are already activated.Check your email for userName and password.'
                });
        }
    }

    //  console.log("req====>",req.body.otp);
    //  console.log("req====>",req.body);
    //  console.log(req.query);
    jwt.verify(req.query.token, 'secret', async (err, decoded) => {
        if (err) {
            console.log(err);
            return res.status(200).json(
                {
                    tokenVerified: false,
                    message: 'your token has expired'
                });
        }
        else {
            if (req.query.ownerId) {
                let ownerId = decrypt(key, req.query.ownerId);
                let owner = await Owner.findOne({ where: { ownerId: ownerId } });
                let contact = decrypt(key, owner.contact);
                let otp = testSms(contact);
                let dbotp = await Otp.create({
                    otpvalue: otp,
                    ownerId: owner.ownerId
                })
            }

            if (req.query.employeeId) {
                let employeeId = decrypt1(key, req.query.employeeId);
                let employee = await Employee.findOne({ where: { employeeId: employeeId } });
                let contact = decrypt1(key, employee.contact);
                let otp = testSms(contact);
                let dbotp = await Otp.create({
                    otpvalue: otp,
                    employeeId: employee.employeeId
                })

            }
            if (req.query.vendorId) {
                let vendorId = decrypt(key, req.query.vendorId);
                let vendor = await Vendor.findOne({ where: { vendorId: vendorId } });
                let contact = decrypt(key, vendor.contact);
                let otp = testSms(contact);
                let dbotp = await Otp.create({
                    otpvalue: otp,
                    vendorId: vendor.vendorId
                })
            }
            if (req.query.tenantId) {
                let tenantId = decrypt1(key, req.query.tenantId);
                let tenant = await Tenant.findOne({ where: { tenantId: tenantId } });
                let contact = decrypt1(key, tenant.contact);
                let otp = testSms(contact);
                let dbotp = await Otp.create({
                    otpvalue: otp,
                    tenantId: tenant.tenantId
                })

            }

            if (req.query.individualVendorId) {
                let individualVendorId = decrypt1(key, req.query.individualVendorId);
                let individualVendor = await IndividualVendor.findOne({ where: { individualVendorId: individualVendorId } });
                let contact = decrypt1(key, individualVendor.contact);
                let otp = testSms(contact);
                let dbotp = await Otp.create({
                    otpvalue: otp,
                    individualVendorId: individualVendor.individualVendorId
                })

            }
            return res.status(200).json(
                {
                    tokenVerified: true,
                    message: 'Your OTP has been sent to your mobile number.'
                });
        }

    }
    )
}