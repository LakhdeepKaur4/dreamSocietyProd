const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status')

const Service = db.service;
const ServiceDetail = db.serviceDetail;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
  let body = req.body;
  body.userId = req.userId;
  console.log("req.body===>", req.body)
  console.log("creating service");
  if (!body.serviceName && !body.serviceDetailId) {
    return res.status(422).json({ message: "Parameters Missing" })
  }

  const services = await Service.findAll({
    where: {
      [Op.and]:[
        {isActive: true},
        {serviceDetailId:req.body.serviceDetailId}
    ]
    }
  })
  // console.log(services);
  let error = services.some(service => {
    return service.serviceName.toLowerCase().replace(/ /g, '') == req.body.serviceName.toLowerCase().replace(/ /g, '');
  });
  if(error) {
    console.log("inside country");
    return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Service Name already Exists" })
  }
  Service.create({
    serviceName: req.body.serviceName,
    serviceDetailId: req.body.serviceDetailId,
  }).then(service => {
    // console.log("service==>",service)
    res.json({ message: "Service added successfully!", service: service });
  }).catch(err => {
    console.log("service error==>", err)
    res.status(500).send("Fail! Error -> " + err);
  })
}

exports.get = (req, res) => {
  Service.findAll({
    where: {
      isActive: true
    },
    order: [['createdAt', 'DESC']],
    include: [{
      model: ServiceDetail,
      attributes: ['serviceDetailId', 'service_detail'],
    }]
  })
    .then(service => {
      res.json(service);
    });
}

exports.getById = (req, res) => {
  Service.findOne({
    where: { id: req.userId },
  }).then(service => {
    res.status(200).json({
      "description": "Service Content Page",
      "service": service
    });
  }).catch(err => {
    res.status(500).json({
      "description": "Can not service Page",
      "error": err
    });
  })
}

exports.update =async (req, res) => {
  console.log(req.body);
  const id = req.params.id;
  const updates = req.body;
  if (!id) {
    res.json("Please enter id");
  }
  const service = await Service.findOne({
    where: {
        [Op.and]:[
            {isActive: true},
            {serviceDetailId:req.body.serviceDetailId}
        ]
    }
})

if(service.serviceName === updates.serviceName){
    const updatedService = await Service.find({ where: { serviceId: id } }).then(service => {
        return service.updateAttributes(updates)
    })
    if (updatedService) {
        return res.status(httpStatus.OK).json({
            message: "Service Updated Page",
            updatedService: updatedService 
        });
    }
}else{
  const services = await Service.findAll({
    where: {
      [Op.and]:[
        {isActive: true},
        {serviceDetailId:req.body.serviceDetailId}
    ]
    }
  })
  // console.log(services);
  let error = services.some(service => {
    return service.serviceName.toLowerCase().replace(/ /g, '') == req.body.serviceName.toLowerCase().replace(/ /g, '');
  });
  if (error) {
    console.log("inside country");
    return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Service Name already Exists" })
  }
  
  Service.find({
    where: { serviceId: id }
  })
    .then(service => {
      return service.updateAttributes(updates)
    })
    .then(updatedService => {
      res.json({ message: "Service updated successfully!", updatedService: updatedService });
    });
  }
}

exports.delete = async (req, res) => {
  console.log("req------>",req);
  const id = req.params.id;
  const update = {isActive:false}
  if (!id) {
    res.json("Please enter id");
  }
  let service = await Service.update(update,{where:{serviceId:id}});
  if(service){
    return res.status(httpStatus.OK).json({
          message: "Service deleted successfully",
        });

  }
}

exports.deleteSelected = async (req, res, next) => {
  try {
    console.log("in service--->")
    const deleteSelected = req.body.ids;
    console.log("delete selected==>", deleteSelected);
    const update = { isActive: false };
    if (!deleteSelected) {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
    }
    const updatedService = await Service.update(update, { where: { serviceId: { [Op.in]: deleteSelected } } })
    if (updatedService) {
      return res.status(httpStatus.OK).json({
        message: "Services deleted successfully",
      });
    }
  } catch (error) {
    console.log(error)
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
}