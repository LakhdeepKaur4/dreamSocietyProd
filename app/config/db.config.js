const env = require('./env.js');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(env.database, env.username, env.password, {
  host: env.host,
  dialect: env.dialect,
  operatorsAliases: false,
  logging: false,

  pool: {
    min: env.pool.min,
    acquire: env.pool.acquire,
    idle: env.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require('../model/user.model.js')(sequelize, Sequelize);
db.role = require('../model/role.model.js')(sequelize, Sequelize);
db.society = require('../model/society.model.js')(sequelize, Sequelize);
db.city = require('../model/city.model.js')(sequelize, Sequelize);
db.country = require('../model/country.model.js')(sequelize, Sequelize);
db.location = require('../model/location.model.js')(sequelize, Sequelize);
db.state = require('../model/state.model.js')(sequelize, Sequelize);
db.tower = require('../model/tower.model.js')(sequelize, Sequelize);
db.flat = require('../model/flat.model.js')(sequelize, Sequelize);
db.service = require('../model/service.model.js')(sequelize, Sequelize);
db.size = require('../model/size.model.js')(sequelize, Sequelize);
db.event = require('../model/event.model.js')(sequelize, Sequelize);
db.serviceDetail = require('../model/serviceDetail.model.js')(sequelize, Sequelize);
db.parking = require('../model/parking.model.js')(sequelize, Sequelize);
db.slot = require('../model/slot.model.js')(sequelize, Sequelize);
db.vendor = require('../model/vendor.model')(sequelize, Sequelize);
db.assets = require('../model/asset.model')(sequelize, Sequelize);
db.assetsType = require('../model/assetType.model')(sequelize, Sequelize);
db.test = require('../model/test.model')(sequelize, Sequelize);
db.flatDetail = require('../model/flatDetail.model')(sequelize, Sequelize);
db.maintenance = require('../model/maintenance.model')(sequelize, Sequelize);
db.maintenanceType = require('../model/maintenanceType.model')(sequelize, Sequelize);
db.rate = require('../model/rate.model.js')(sequelize, Sequelize);
db.employeeType = require('../model/employeeType.model')(sequelize, Sequelize);
db.employeeWorkType = require('../model/employeeWorkType.model')(sequelize, Sequelize);
db.employeeDetail = require('../model/employeeDetail.model')(sequelize, Sequelize);
db.vendorService = require('../model/vendorService.model')(sequelize, Sequelize);
db.inventory = require('../model/inventory.model')(sequelize, Sequelize);
db.employee = require('../model/employee.model')(sequelize, Sequelize);
db.designation = require('../model/designation.model')(sequelize, Sequelize);
db.societyBoardMember = require('../model/societyBoardMember.model')(sequelize, Sequelize);
db.relation = require('../model/relation.model')(sequelize, Sequelize);
db.societyMemberEvent = require('../model/societyMemberEvent.model')(sequelize, Sequelize);
db.owner = require('../model/owner.model')(sequelize, Sequelize);
db.ownerMembersDetail = require('../model/ownerMembersDetail')(sequelize, Sequelize);
db.tenant = require('../model/tenant.model')(sequelize, Sequelize);
db.tenantMembersDetail = require('../model/tenantMemberDetails.model')(sequelize, Sequelize);
db.societyMemberEventBooking = require('../model/societyMemberEventBooking.model')(sequelize, Sequelize);
db.eventSpace = require('../model/eventSpaceMaster.model')(sequelize, Sequelize);
db.floor = require('../model/floor.model')(sequelize, Sequelize);
db.towerFloor = require('../model/towerFloor.model')(sequelize, Sequelize);
db.otp = require('../model/otp.model')(sequelize, Sequelize);
db.otpUserVerify = require('../model/otpUserModel')(sequelize, Sequelize);
db.tokenVerify = require('../model/tokenModel')(sequelize, Sequelize);
db.userRole = require('../model/userRoles.model')(sequelize, Sequelize);
db.eventBooking = require('../model/eventBooking.model')(sequelize, Sequelize);
db.individualVendor = require('../model/individualVendor.model')(sequelize, Sequelize);
db.flatParking = require('../model/flatParking.model')(sequelize, Sequelize);
db.tenantFlatDetail = require('../model/tenantFlatDetail.model')(sequelize, Sequelize);
db.ownerFlatDetail = require('../model/ownerFlatDetail.model')(sequelize, Sequelize);
db.complaint = require('../model/complaint.model')(sequelize, Sequelize);
db.complaintStatus = require('../model/complaintStatus.model')(sequelize, Sequelize);
db.machine = require('../model/machine.model')(sequelize, Sequelize);
db.machineDetail = require('../model/machineDetail.model')(sequelize, Sequelize);
db.rfid = require('../model/rfid.model')(sequelize, Sequelize);
db.fingerprintData = require('../model/fingerprintData.model')(sequelize, Sequelize);
db.commonArea = require('../model/commonArea.model')(sequelize, Sequelize);
db.electricityConsumer = require('../model/electricityConsumer.model')(sequelize, Sequelize);
db.commonAreaDetail = require('../model/commonAreaDetail.model')(sequelize, Sequelize);
db.areaMachine = require('../model/AreaMachine.model')(sequelize, Sequelize);
db.userRfid = require('../model/userRfid.model')(sequelize, Sequelize);
db.vendorComplaints = require('../model/vendorComplaints.model')(sequelize, Sequelize);
db.vendorComplaints = require('../model/vendorComplaints.model')(sequelize, Sequelize);
db.purchaseOrder = require('../model/purchaseOrder.model')(sequelize, Sequelize);
db.purchaseOrderDetails = require('../model/purchaseOrderDetails.model')(sequelize, Sequelize);
db.feedback = require('../model/feedback.model')(sequelize, Sequelize);
db.facilities = require('../model/facilities.model')(sequelize, Sequelize);
db.facilitiesDetails = require('../model/facilitiesDetails.model')(sequelize, Sequelize);
db.fingerprintMachineData = require('../model/fingerprintMachineData.model')(sequelize, Sequelize);
db.punchedfingerprintMachineData = require('../model/punchedFingerprintData.model')(sequelize, Sequelize);
db.userFacility = require('../model/userFacility.model')(sequelize, Sequelize);
db.video = require('../model/video.model')(sequelize, Sequelize);
db.userVideo = require('../model/userVideo.model')(sequelize, Sequelize);
db.vendorAllotment = require('../model/vendorAllotment.model')(sequelize, Sequelize);
db.meterDetail = require('../model/meterDetail.model')(sequelize, Sequelize);
db.meter = require('../model/meter.model')(sequelize, Sequelize);
db.individualVendorBooking = require('../model/individualVendorBooking.model')(sequelize, Sequelize);
db.maintenanceCharges = require('../model/maintainanceCharges')(sequelize, Sequelize);
db.facilitiesCharges = require('../model/facilitiesCharges.model')(sequelize, Sequelize);
db.electricityCharges = require('../model/electricityCharges')(sequelize, Sequelize);
db.cardDetails = require('../model/card.model')(sequelize,Sequelize);
 
db.otp.belongsTo(db.owner, { foreignKey: 'ownerId' });
db.otp.belongsTo(db.tenant, { foreignKey: 'tenantId' });
db.otp.belongsTo(db.employee, { foreignKey: 'employeeId' });
db.otp.belongsTo(db.vendor, { foreignKey: 'vendorId' });
db.otp.belongsTo(db.individualVendor, { foreignKey: 'individualVendorId' });
db.otp.belongsTo(db.ownerMembersDetail, { foreignKey: 'memberId' });
db.otp.belongsTo(db.tenantMembersDetail, { foreignKey: 'tenantMemberId' });

// db.role.belongsToMany(db.user, { through: 'user_roles', foreignKey: 'roleId', otherKey: 'userId' });
// db.user.belongsToMany(db.role, { through: 'user_roles', foreignKey: 'userId', otherKey: 'roleId' });
db.society.belongsTo(db.city, { foreignKey: 'cityId' });
db.society.belongsTo(db.country, { foreignKey: 'countryId' });
db.society.belongsTo(db.location, { foreignKey: 'locationId' });
db.society.belongsTo(db.state, { foreignKey: 'stateId' });
db.society.belongsTo(db.user, { foreignKey: 'userId' });
db.country.belongsTo(db.user, { foreignKey: 'userId' });
db.state.belongsTo(db.country, { foreignKey: 'countryId' });
db.state.belongsTo(db.user, { foreignKey: 'userId' });
db.city.belongsTo(db.user, { foreignKey: 'userId' });
db.city.belongsTo(db.state, { foreignKey: 'stateId' });
db.city.belongsTo(db.country, { foreignKey: 'countryId' })
db.location.belongsTo(db.country, { foreignKey: 'countryId' });
db.location.belongsTo(db.state, { foreignKey: 'stateId' });
db.location.belongsTo(db.city, { foreignKey: 'cityId' });
db.location.belongsTo(db.user, { foreignKey: 'userId' });
db.flat.belongsTo(db.size, { foreignKey: 'sizeId' });
db.flat.belongsTo(db.society, { foreignKey: 'societyId' });
db.event.belongsTo(db.user, { foreignKey: 'eventOrganiser', as: 'organiser' });
db.event.belongsTo(db.user, { foreignKey: 'userId', as: 'loggedIn' });
db.service.belongsTo(db.serviceDetail, { foreignKey: 'serviceDetailId' });
db.slot.belongsTo(db.parking, { foreignKey: 'parkingId' });
db.vendor.belongsTo(db.user, { foreignKey: 'userId' });
db.assets.belongsTo(db.user, { foreignKey: 'userId' });
db.assetsType.belongsTo(db.user, { foreignKey: 'userId' });
db.assetsType.belongsTo(db.assets, { foreignKey: 'assetId' });
db.flatDetail.belongsTo(db.tower, { foreignKey: 'towerId' });
db.flatDetail.belongsTo(db.floor, { foreignKey: 'floorId' });
db.flatDetail.belongsTo(db.flat, { foreignKey: 'flatId' });
db.flatDetail.belongsTo(db.user, { foreignKey: 'userId' });
db.flatParking.belongsTo(db.parking, { foreignKey: 'parkingId' });
db.flatParking.belongsTo(db.slot, { foreignKey: 'slotId' });
db.flatParking.belongsTo(db.flatDetail, { foreignKey: 'flatDetailId' });
db.user.belongsTo(db.tower, { foreignKey: 'towerId' });
db.maintenance.belongsTo(db.user, { foreignKey: 'userId' });
db.maintenanceType.belongsTo(db.user, { foreignKey: 'userId' });
db.maintenanceType.belongsTo(db.size, { foreignKey: 'sizeId' });
db.maintenanceType.belongsTo(db.maintenance, { foreignKey: 'maintenanceId' });
db.rate.belongsTo(db.user, { foreignKey: 'userId' });
db.employeeType.belongsTo(db.user, { foreignKey: 'userId' });
db.employeeWorkType.belongsTo(db.user, { foreignKey: 'userId' })
db.employeeDetail.belongsTo(db.employeeType, { foreignKey: 'employeeTypeId' })
db.employeeDetail.belongsTo(db.employeeWorkType, { foreignKey: 'employeeWorkTypeId' })
db.employeeDetail.belongsTo(db.user, { foreignKey: 'userId' });
db.vendor.hasMany(db.vendorService, { foreignKey: 'vendorId' });
db.vendorService.belongsTo(db.vendor, { foreignKey: 'vendorId' });
db.vendorService.belongsTo(db.rate, { foreignKey: 'rateId' });
db.vendorService.belongsTo(db.user, { foreignKey: 'userId' });
db.vendorService.belongsTo(db.service, { foreignKey: 'serviceId' });
db.inventory.belongsTo(db.assets, { foreignKey: 'assetId' });
db.inventory.belongsTo(db.assetsType, { foreignKey: 'assetTypeId' });
db.inventory.belongsTo(db.user, { foreignKey: 'userId' });
db.employee.belongsTo(db.user, { foreignKey: 'userId' });
db.employee.belongsTo(db.user, { foreignKey: 'userId' });

db.designation.belongsTo(db.user, { foreignKey: 'userId' });
db.societyBoardMember.belongsTo(db.user, { foreignKey: 'userId' });
db.societyBoardMember.belongsTo(db.society, { foreignKey: 'societyId' });
db.societyBoardMember.belongsTo(db.designation, { foreignKey: 'designationId' });
db.relation.belongsTo(db.user, { foreignKey: 'userId' });
db.societyMemberEvent.belongsTo(db.user, { foreignKey: 'userId' });
db.inventory.belongsTo(db.assets, { foreignKey: 'assetId' });
db.owner.hasMany(db.ownerMembersDetail, { foreignKey: 'ownerId' });
// db.owner.belongsTo(db.ownerMembersDetail,{foreignKey:'ownerMemberId',as:'member',constraints: false, allowNull:true, defaultValue:null});
db.ownerMembersDetail.belongsTo(db.relation, { foreignKey: 'relationId' });
db.ownerMembersDetail.belongsTo(db.user, { foreignKey: 'userId' });
db.ownerMembersDetail.belongsTo(db.rfid, { foreignKey: 'memberRfId' });
db.ownerMembersDetail.belongsTo(db.flatDetail, { foreignKey: 'flatDetailId' });

db.owner.belongsTo(db.user, { foreignKey: 'userId' });
db.rfid.belongsTo(db.user, { foreignKey: 'userId' });
db.machine.belongsTo(db.user, { foreignKey: 'userId' });
db.machineDetail.belongsTo(db.user, { foreignKey: 'userId' });
db.owner.belongsTo(db.society, { foreignKey: 'societyId' });
db.owner.belongsTo(db.tower, { foreignKey: 'towerId' });
// db.owner.belongsTo(db.flatDetail, { foreignKey: 'flatDetailId' });
db.owner.belongsTo(db.floor, { foreignKey: 'floorId' });
db.owner.belongsToMany(db.flatDetail, { through: 'owner_flatDetail_master', foreignKey: 'ownerId' });
db.owner.belongsTo(db.rfid, { foreignKey: 'rfidId' });
db.flatDetail.belongsToMany(db.owner, { through: 'owner_flatDetail_master', foreignKey: 'flatDetailId' });
db.tenant.hasMany(db.tenantMembersDetail, { foreignKey: 'tenantId' });
db.tenantMembersDetail.belongsTo(db.tenant, { foreignKey: 'tenantId' });
// db.tenant.belongsTo(db.owner, { as: 'Owner1', foreignKey: 'ownerId1' });
// db.tenant.belongsTo(db.owner, { as: 'Owner2', foreignKey: 'ownerId2' });
// db.tenant.belongsTo(db.owner, { as: 'Owner3', foreignKey: 'ownerId3' });
db.tenantMembersDetail.belongsTo(db.relation, { foreignKey: 'relationId' });
db.tenantMembersDetail.belongsTo(db.user, { foreignKey: 'userId' });
db.tenantMembersDetail.belongsTo(db.flatDetail, { foreignKey: 'flatDetailId' });
// db.tenantMembersDetail.belongsTo(db.rfid, { foreignKey: 'rfidId' });
db.tenant.belongsTo(db.user, { foreignKey: 'userId' });
db.tenant.belongsTo(db.society, { foreignKey: 'societyId' });
db.tenant.belongsTo(db.tower, { foreignKey: 'towerId' });
// db.tenant.belongsTo(db.rfid, { foreignKey: 'rfidId' });
db.tenant.belongsToMany(db.flatDetail, { through: 'tenant_flatDetail_master', foreignKey: 'tenantId' });
db.flatDetail.belongsToMany(db.tenant, { as: 'TenantFlat', through: 'tenant_flatDetail_master', foreignKey: 'flatDetailId' });
db.tenant.belongsTo(db.floor, { foreignKey: 'floorId' });
db.societyMemberEventBooking.belongsTo(db.user, { foreignKey: 'userId' });
db.societyMemberEventBooking.belongsTo(db.societyMemberEvent, { foreignKey: 'societyMemberEventId' });
db.societyMemberEventBooking.belongsTo(db.eventSpace, { foreignKey: 'eventSpaceId' });
db.eventSpace.belongsTo(db.user, { foreignKey: 'userId' });
db.eventSpace.belongsTo(db.size, { foreignKey: 'sizeId' });
db.floor.belongsTo(db.user, { foreignKey: 'userId' });
// db.tower.hasMany(db.floor, {foreignKey: 'floorId',constraints: false, allowNull:true, defaultValue:null});
// db.floor.belongsTo(db.tower,{foreignKey:'towerId'});
db.tower.belongsTo(db.user, { foreignKey: 'userId', constraints: false, allowNull: true, defaultValue: null });
db.tower.belongsToMany(db.floor, { as: 'Floors', through: 'tower_floor_master', foreignKey: 'towerId', otherKey: 'floorId' });
db.floor.belongsToMany(db.tower, { as: 'Towers', through: 'tower_floor_master', foreignKey: 'floorId', otherKey: 'towerId' });

db.role.belongsToMany(db.user, { through: 'user_role_master', foreignKey: 'roleId', otherKey: 'userId', unique: false });
db.user.belongsToMany(db.role, { through: 'user_role_master', foreignKey: 'userId', otherKey: 'roleId', unique: false });

db.employee.belongsTo(db.employeeDetail, { foreignKey: 'employeeDetailId' });
db.eventBooking.belongsTo(db.user, { foreignKey: 'eventOrganiser' });
db.eventBooking.belongsTo(db.event, { foreignKey: 'eventId' });
db.eventBooking.belongsTo(db.eventSpace, { foreignKey: 'eventSpaceId' });
db.eventBooking.belongsTo(db.user, { foreignKey: 'eventOrganiser' });
db.individualVendor.belongsTo(db.user, { foreignKey: 'userId' });
db.individualVendor.belongsTo(db.country, { foreignKey: 'countryId' });
db.individualVendor.belongsTo(db.state, { foreignKey: 'stateId' });
db.individualVendor.belongsTo(db.city, { foreignKey: 'cityId' });
db.individualVendor.belongsTo(db.location, { foreignKey: 'locationId' });
db.individualVendor.belongsTo(db.service, { foreignKey: 'serviceId' });
db.individualVendor.belongsTo(db.rate, { foreignKey: 'rateId' });
db.complaint.belongsTo(db.service, { foreignKey: 'serviceId' });
db.complaint.belongsTo(db.vendor, { foreignKey: 'vendorId' });
db.complaint.belongsTo(db.flatDetail, { foreignKey: 'flatDetailId' });
db.complaint.belongsTo(db.complaintStatus, { foreignKey: 'complaintStatusId' });
db.complaint.belongsTo(db.user, { foreignKey: 'userId' });
db.machine.belongsTo(db.flatDetail, { foreignKey: 'flatDetailId' });
db.machine.belongsTo(db.machineDetail, { foreignKey: 'machineDetailId' });
db.electricityConsumer.belongsTo(db.flatDetail, { foreignKey: 'flatDetailId' });
// db.electricityConsumer.belongsTo(db.maintenanceType, { foreignKey: 'rate', targetKey: 'maintenanceTypeId' });
// db.maintenanceType.hasOne(db.electricityConsumer, { foreignKey: 'rate', sourceKey: 'maintenanceTypeId' });
db.commonArea.belongsTo(db.user, { foreignKey: 'userId' });
db.commonAreaDetail.belongsTo(db.user, { foreignKey: 'userId' });
db.commonAreaDetail.belongsToMany(db.machineDetail, { as: 'Machine', through: 'area_machine_master', foreignKey: 'commonAreaDetailId' });
db.machineDetail.belongsToMany(db.commonAreaDetail, { as: 'CommonArea', through: 'area_machine_master', foreignKey: 'machineDetailId' });
// db.commonArea.belongsToMany(db.machine, { through: 'common_area_detail_master', foreignKey: 'commonAreaId' });
// db.machineDetail.belongsToMany(db.commonArea, { through: 'common_area_detail_master', foreignKey: 'machineDetailId'});
// db.commonAreaDetail.belongsTo(db.machineDetail, { foreignKey: 'machineDetailId' });
db.commonAreaDetail.belongsTo(db.commonArea, { foreignKey: 'commonAreaId' });
db.userRfid.belongsTo(db.user, { foreignKey: 'userId' });
db.userRfid.belongsTo(db.rfid, { foreignKey: 'rfidId' });
db.fingerprintData.belongsTo(db.user, { foreignKey: 'userId', as: 'user' });
db.fingerprintMachineData.belongsTo(db.user, { foreignKey: 'userId', as: 'user' });
db.punchedfingerprintMachineData.belongsTo(db.user, { foreignKey: 'userId', as: 'user' });
db.vendor.belongsToMany(db.complaint, { through: 'vendor_complaints_master', foreignKey: 'vendorId' });
db.vendor.belongsTo(db.rfid, { foreignKey: 'rfidId' });
db.complaint.belongsToMany(db.vendor, { through: 'vendor_complaints_master', foreignKey: 'complaintId' });
db.purchaseOrder.belongsTo(db.vendor, { foreignKey: 'vendorId' });
db.purchaseOrderDetails.belongsTo(db.purchaseOrder, { foreignKey: 'purchaseOrderId' });
db.feedback.belongsTo(db.user, { foreignKey: 'userId' });
db.feedback.belongsTo(db.complaint, { foreignKey: 'complaintId' });
db.feedback.belongsTo(db.vendor, { foreignKey: 'vendorId' });
db.facilitiesDetails.belongsTo(db.facilities, { foreignKey: 'facilityId' });
db.userFacility.belongsTo(db.facilitiesDetails, { foreignKey: 'facilityDetailId' });
db.userFacility.belongsTo(db.user, { foreignKey: 'userId' });
// db.video.belongsTo(db.user, { foreignKey: 'userId' });
db.user.belongsToMany(db.video, { as: 'Video', through: 'user_video_master', foreignKey: 'userId' });
db.video.belongsToMany(db.user, { as: 'User', through: 'user_video_master', foreignKey: 'videoId' });
db.vendorAllotment.belongsTo(db.individualVendor, { foreignKey: 'individualVendorId', as: 'Vendor' });
db.vendorAllotment.belongsTo(db.user, { foreignKey: 'userId' });
db.vendorAllotment.belongsTo(db.user, { foreignKey: 'bookedBy', as: 'User', defaultValue: null });
db.meter.belongsTo(db.user, { foreignKey: 'userId' });
db.meter.belongsTo(db.flatDetail, { foreignKey: 'flatDetailId' });
db.meter.belongsTo(db.meterDetail, { foreignKey: 'meterDetailId' });
db.individualVendorBooking.belongsTo(db.individualVendor, { foreignKey: 'individualVendorId' });
db.individualVendorBooking.belongsTo(db.user, { foreignKey: 'bookedBy' });
db.individualVendorBooking.belongsTo(db.flatDetail, { foreignKey: 'flatDetailId' });
db.individualVendorBooking.belongsTo(db.user, { foreignKey: 'userId' });
db.maintenanceCharges.belongsTo(db.flatDetail, { foreignKey: 'flatDetailId' });
db.maintenanceCharges.belongsTo(db.maintenanceType, { foreignKey: 'maintenanceTypeId' });
db.facilitiesCharges.belongsTo(db.facilitiesDetails, { foreignKey: 'facilityDetailId' });
db.facilitiesCharges.belongsTo(db.user, { foreignKey: 'userId' });
db.electricityCharges.belongsTo(db.meter, { foreignKey: 'meterId' });
db.electricityCharges.belongsTo(db.maintenanceType, { foreignKey: 'maintenanceTypeId' });
db.electricityCharges.belongsTo(db.flatDetail, { foreignKey: 'flatDetailId' });

module.exports = db;





























































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































