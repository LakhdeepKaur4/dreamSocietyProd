const verifySignUp = require('./verifySignUp');
const authJwt = require('./verifyJwtToken');
const fileUploadConfig = require('../config/multer');

module.exports = function (app) {

	const userController = require('../controller/user.js');
	const cityController = require('../controller/city');
	const countryController = require('../controller/country');
	const stateController = require('../controller/state');
	const societyController = require('../controller/society');
	const locationController = require('../controller/location');
	const towerController = require('../controller/tower');
	const flatController = require('../controller/flat');
	const serviceController = require('../controller/service');
	const sizeController = require('../controller/size');
	const messageController = require('../controller/message');
	const eventController = require('../controller/event');
	const serviceDetailController = require('../controller/serviceDetail');
	const parkingController = require('../controller/parking');
	const slotController = require('../controller/slot');
	const vendorController = require('../controller/vendor');
	const assetsController = require('../controller/assets');
	const assetsTypeController = require('../controller/assetType');
	const flatDetailController = require('../controller/flatDetail');
	const maintenanceController = require('../controller/maintenance');
	const maintenanceTypeController = require('../controller/maintenanceType');
	const rateController = require('../controller/rate');
	const employeeTypeController = require('../controller/employeeType');
	const employeeWorkTypeController = require('../controller/employeeWorkType');
	const employeeDetailController = require('../controller/employeeDetail');
	const inventoryController = require('../controller/inventory');
	const employeeController = require('../controller/employee');
	const designationController = require('../controller/designation');
	const societyBoardMemberController = require('../controller/societyBoardMember');
	const relationController = require('../controller/relation');
	const societyMemberEvent = require('../controller/societyMemberEvent');
	const owner = require('../controller/owner');
	const tenant = require('../controller/tenant');
	const societyMemberEventBooking = require('../controller/societyMemberEventBooking');
	const eventSpaceController = require('../controller/eventSpaceMaster');
	const floor = require('../controller/floor');
	const otpChecker = require('../controller/otpchecker');
	const checkToken = require('../controller/checktoken');



	app.get('/', userController.start);

	app.post('/api/auth/signup', [verifySignUp.checkRolesExisted], userController.signupEncrypted);

	app.post('/api/auth/signin', userController.signinDecrypted);

	app.get('/api/user',  userController.getUserDecrypted);

	app.get('/api/person', [authJwt.verifyToken], userController.getPersonDecrypted);

	app.get('/api/user/search', userController.search);

	// app.get('/api/user/test', [authJwt.verifyToken], userController.userContent);

	app.get('/api/user/userRole', [authJwt.verifyToken], userController.roleTest);

	app.get('/api/user/role', [authJwt.verifyToken], userController.role);

	app.put('/api/user/:id', [authJwt.verifyToken], userController.updateEncrypted);

	app.get('/api/user/:id', userController.getById);

	app.post('/api/user/changePassword', [authJwt.verifyToken], userController.changePassword);

	app.get('/api/forgotPassword/:userName', userController.forgottenPassword);

	app.post('/api/otpVerify', userController.otpVerify);

	app.get('/api/tokenVerify/:url', userController.tokenVerify)

	app.post('/api/resetPassword', userController.resetPassword);

	app.put('/api/user/delete/deleteSelected', [authJwt.verifyToken], userController.deleteSelected);

	app.put('/api/user/delete/:id', [authJwt.verifyToken], userController.delete);

	app.get('/api/test/owner', [authJwt.verifyToken, authJwt.isOwnerOrTenant], userController.managementBoard);

	app.get('/api/test/admin', [authJwt.verifyToken, authJwt.isAdmin], userController.adminBoard);

	app.post('/api/city', [authJwt.verifyToken], cityController.create);

	app.get('/api/city', [authJwt.verifyToken], cityController.get);

	app.get('/api/city/:id', [authJwt.verifyToken], cityController.getById);

	app.put('/api/city/delete/deleteSelected', [authJwt.verifyToken], cityController.deleteSelected);

	app.put('/api/city/:id', [authJwt.verifyToken], cityController.update);

	// app.delete('/api/city/:id',[authJwt.verifyToken],cityController.deleteById);

	app.delete('/api/city/:id', [authJwt.verifyToken], cityController.deleteById)

	app.put('/api/city/delete/:id', [authJwt.verifyToken], cityController.delete);

	app.delete('/api/city/:id', [authJwt.verifyToken], cityController.delete);

	app.post('/api/country', [authJwt.verifyToken], countryController.create);

	app.get('/api/country', [authJwt.verifyToken], countryController.get);

	app.get('/api/country/:id', [authJwt.verifyToken], countryController.getById);

	app.put('/api/country/:id', [authJwt.verifyToken], countryController.update);

	app.put('/api/country/delete/deleteSelected', [authJwt.verifyToken], countryController.deleteSelected);

	app.put('/api/country/delete/:id', [authJwt.verifyToken], countryController.delete);

	app.post('/api/state', [authJwt.verifyToken], stateController.create);

	app.get('/api/state', [authJwt.verifyToken], stateController.get);

	app.get('/api/state/:id', [authJwt.verifyToken], stateController.getById);

	app.put('/api/state/:id', [authJwt.verifyToken], stateController.update);

	app.put('/api/state/delete/deleteSelected', [authJwt.verifyToken], stateController.deleteSelected);

	app.put('/api/state/delete/:id', [authJwt.verifyToken], stateController.delete);

	app.post('/api/location', [authJwt.verifyToken], locationController.create);

	app.get('/api/location', [authJwt.verifyToken], locationController.get);

	app.get('/api/location/:id', [authJwt.verifyToken], locationController.getById);

	app.put('/api/location/:id', [authJwt.verifyToken], locationController.update);

	app.put('/api/location/delete/deleteSelected', [authJwt.verifyToken], locationController.deleteSelected);

	app.put('/api/location/delete/:id', [authJwt.verifyToken], locationController.delete);

	app.post('/api/society', [authJwt.verifyToken], societyController.createEncrypted);

	app.get('/api/society', [authJwt.verifyToken], societyController.getDecrypted);

	app.get('/api/society/:id', [authJwt.verifyToken], societyController.getByIdDecrypted);

	app.put('/api/society/:id', [authJwt.verifyToken], societyController.updateEncrypted);

	app.put('/api/society/delete/deleteSelected', [authJwt.verifyToken], societyController.deleteSelected);

	app.put('/api/society/delete/:id', [authJwt.verifyToken], societyController.delete);

	app.post('/api/tower', [authJwt.verifyToken], towerController.create);

	app.get('/api/tower', [authJwt.verifyToken], towerController.get);

	app.get('/api/towerFloor', [authJwt.verifyToken], towerController.getTowerAndFloor);

	app.get('/api/towerFloor/:id', [authJwt.verifyToken], towerController.getFloorByTowerId);

	app.put('/api/towerFloor/update/:id', [authJwt.verifyToken], towerController.update);

	app.get('/api/tower/:id', [authJwt.verifyToken], towerController.getById);

	app.put('/api/tower/:id', [authJwt.verifyToken], towerController.update);

	app.put('/api/tower/delete/deleteSelected', [authJwt.verifyToken], towerController.deleteSelected);

	app.put('/api/tower/delete/:id', [authJwt.verifyToken], towerController.delete);

	app.post('/api/flat', [authJwt.verifyToken], flatController.create);

	app.get('/api/flat', [authJwt.verifyToken], flatController.get);

	app.put('/api/flat/:id', [authJwt.verifyToken], flatController.update);

	app.get('/api/flat/pagination/:page', [authJwt.verifyToken], flatController.getFlatByPageNumber);

	app.put('/api/flat/limit/:page', [authJwt.verifyToken], flatController.getFlatByLimit);

	app.get('/api/flat/test', [authJwt.verifyToken], flatController.getFlatByLimit);

	app.get('/api/flat/:id', [authJwt.verifyToken], flatController.getById);

	app.put('/api/flat/delete/deleteSelected', [authJwt.verifyToken], flatController.deleteSelected);

	app.put('/api/flat/delete/:id', [authJwt.verifyToken], flatController.delete);

	app.post('/api/service', [authJwt.verifyToken], serviceController.create);

	app.get('/api/service', [authJwt.verifyToken], serviceController.get);

	app.get('/api/service/:id', [authJwt.verifyToken], serviceController.getById);

	app.put('/api/service/:id', [authJwt.verifyToken], serviceController.update);

	app.put('/api/service/delete/deleteSelected', [authJwt.verifyToken], serviceController.deleteSelected);

	app.put('/api/service/:id', [authJwt.verifyToken], serviceController.delete);

	app.post('/api/size', [authJwt.verifyToken], sizeController.create);

	app.get('/api/size', [authJwt.verifyToken], sizeController.get);

	app.get('/api/size/:id', [authJwt.verifyToken], sizeController.getById);

	app.put('/api/size/:id', [authJwt.verifyToken], sizeController.update);

	app.put('/api/size/delete/deleteSelected', [authJwt.verifyToken], sizeController.deleteSelected);

	app.put('/api/size/delete/:id', [authJwt.verifyToken], sizeController.delete);

	app.post('/api/event', [authJwt.verifyToken], eventController.create);

	app.get('/api/event', [authJwt.verifyToken], eventController.get);

	app.put('/api/event/:id', [authJwt.verifyToken], eventController.update);

	app.put('/api/event/delete/deleteSelected', [authJwt.verifyToken], eventController.deleteSelected);

	app.put('/api/event/delete/:id', [authJwt.verifyToken], eventController.delete);

	app.post('/api/sendMessage', [authJwt.verifyToken], messageController.sendMessage);

	app.post('/api/serviceDetail', [authJwt.verifyToken], serviceDetailController.create);

	app.get('/api/serviceDetail', [authJwt.verifyToken], serviceDetailController.get);

	app.get('/api/eventOrganiser', [authJwt.verifyToken], eventController.getEventOrganiser);

	app.post('/api/parking', [authJwt.verifyToken], parkingController.create);

	app.get('/api/parking', [authJwt.verifyToken], parkingController.get);

	app.post('/api/slot', [authJwt.verifyToken], slotController.create);

	app.get('/api/slot', slotController.get);

	// app.get('/api/getSlot',slotController.getslots);

	app.get('/api/getState/:id', [authJwt.verifyToken], stateController.getCountry);

	// app.post('/api/vendor', [authJwt.verifyToken] ,vendorController.create);

	app.post('/api/vendor/', [authJwt.verifyToken], fileUploadConfig.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'documentOne', maxCount: 1 }, { name: 'documentTwo', maxCount: 1 }]), vendorController.create1);

	app.get('/api/vendor/', [authJwt.verifyToken], vendorController.get1);

	app.put('/api/vendor/:id', [authJwt.verifyToken], fileUploadConfig.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'documentOne', maxCount: 1 }, { name: 'documentTwo', maxCount: 1 }]), vendorController.update1);

	app.put('/api/vendor/delete/deleteSelected', [authJwt.verifyToken], vendorController.deleteSelected);

	app.put('/api/vendor/delete/:id', [authJwt.verifyToken], vendorController.delete);

	app.put('/api/vendorService/:id', [authJwt.verifyToken], vendorController.updateVendorService);

	app.put('/api/vendorService/delete/deleteSelected', [authJwt.verifyToken], vendorController.deleteSelectedVendorServices);

	app.put('/api/vendorService/delete/:id', [authJwt.verifyToken], vendorController.deleteVendorService);

	app.post('/api/assets', [authJwt.verifyToken], assetsController.create);

	app.get('/api/assets', [authJwt.verifyToken], assetsController.get);

	app.get('/api/assets/:page', [authJwt.verifyToken], assetsController.getAssetsByPageNumber);

	app.put('/api/assets/:id', [authJwt.verifyToken], assetsController.update);

	app.put('/api/assets/delete/deleteSelected', [authJwt.verifyToken], assetsController.deleteSelected);

	app.put('/api/assets/delete/:id', [authJwt.verifyToken], assetsController.delete);

	app.delete('/api/assets/:id', [authJwt.verifyToken], assetsController.deleteById);

	app.post('/api/assetsType', [authJwt.verifyToken], assetsTypeController.create);

	app.get('/api/assetsType/', [authJwt.verifyToken], assetsTypeController.get);

	app.get('/api/assetsType/:page', [authJwt.verifyToken], assetsTypeController.getAssetsTypeByPageNumber);

	app.put('/api/assetsType/:id', [authJwt.verifyToken], assetsTypeController.update);

	app.delete('/api/assetsType/:id', [authJwt.verifyToken], assetsTypeController.deleteById);

	app.put('/api/assetsType/delete/deleteSelected', [authJwt.verifyToken], assetsTypeController.deleteSelected);

	app.put('/api/assetsType/delete/:id', [authJwt.verifyToken], assetsTypeController.delete);

	app.post('/api/user/encrypt', userController.encryptData);

	app.post('/api/auth/signupCopy', [verifySignUp.checkRolesExisted], userController.signupCopy);

	app.post('/api/flatDetail', [authJwt.verifyToken], flatDetailController.create);

	app.get('/api/flatDetail', [authJwt.verifyToken], flatDetailController.get);

	app.put('/api/flatDetail/:id', [authJwt.verifyToken], flatDetailController.update);

	app.put('/api/flatDetail/delete/deleteSelected', [authJwt.verifyToken], flatDetailController.deleteSelected);

	app.put('/api/flatDetail/delete/:id', [authJwt.verifyToken], flatDetailController.delete);

	app.post('/api/maintenance', [authJwt.verifyToken], maintenanceController.create);

	app.get('/api/maintenance', [authJwt.verifyToken], maintenanceController.get);

	app.put('/api/maintenance/:id', [authJwt.verifyToken], maintenanceController.update);

	app.put('/api/maintenance/delete/deleteSelected', [authJwt.verifyToken], maintenanceController.deleteSelected);

	app.put('/api/maintenance/delete/:id', [authJwt.verifyToken], maintenanceController.delete);

	app.post('/api/maintenanceType', [authJwt.verifyToken], maintenanceTypeController.create);

	app.put('/api/maintenanceType/:id', [authJwt.verifyToken], maintenanceTypeController.update);

	app.put('/api/maintenanceType/delete/deleteSelected', [authJwt.verifyToken], maintenanceTypeController.deleteSelected);

	app.put('/api/maintenanceType/delete/:id', [authJwt.verifyToken], maintenanceTypeController.delete);

	app.get('/api/maintenanceType', [authJwt.verifyToken], maintenanceTypeController.get);

	app.post('/api/rate', [authJwt.verifyToken], rateController.create);

	app.get('/api/rate', [authJwt.verifyToken], rateController.get);

	app.post('/api/employeeType', [authJwt.verifyToken], employeeTypeController.create);

	app.get('/api/employeeType', [authJwt.verifyToken], employeeTypeController.get);

	app.post('/api/employeeWorkType', [authJwt.verifyToken], employeeWorkTypeController.create);

	app.get('/api/employeeWorkType', [authJwt.verifyToken], employeeWorkTypeController.get);

	app.post('/api/employeeDetail', [authJwt.verifyToken], employeeDetailController.create);

	app.get('/api/employeeDetail', [authJwt.verifyToken], employeeDetailController.get);

	app.put('/api/employeeDetail/:id', [authJwt.verifyToken], employeeDetailController.update);

	app.put('/api/employeeDetail/delete/deleteSelected', [authJwt.verifyToken], employeeDetailController.deleteSelected);

	app.put('/api/employeeDetail/delete/:id', [authJwt.verifyToken], employeeDetailController.delete);

	// app.post("/api/test/upload",fileUploadConfig.single('profileImage'),vendorController.uploadPicture);

	// app.post("/api/test/upload",fileUploadConfig.array('photos',3),vendorController.uploadMultiple);

	// app.post("/api/test/upload",fileUploadConfig.fields([{name:'profilePicture',maxCount:1},{name:'document',maxCount:2}]),vendorController.uploadMultiple)

	app.post('/api/inventory', [authJwt.verifyToken], inventoryController.create);

	app.get('/api/inventory', [authJwt.verifyToken], inventoryController.get);

	app.put('/api/inventory/:id', [authJwt.verifyToken], inventoryController.update);

	app.put('/api/inventory/delete/deleteSelected', [authJwt.verifyToken], inventoryController.deleteSelected);

	app.put('/api/inventory/delete/:id', [authJwt.verifyToken], inventoryController.delete);

	app.post('/api/employee', [authJwt.verifyToken], fileUploadConfig.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'documentOne', maxCount: 1 }, { name: 'documentTwo', maxCount: 1 }]), employeeController.createEncrypt);

	app.put('/api/employee/delete/deleteSelected', [authJwt.verifyToken], employeeController.deleteSelected);

	app.get('/api/employee', [authJwt.verifyToken], employeeController.getDecrypt);

	// app.put('/api/employee/:id',[authJwt.verifyToken],employeeController.update);

	app.put('/api/employee/delete/:id', [authJwt.verifyToken], employeeController.delete);

	app.put('/api/employee/:id', [authJwt.verifyToken], fileUploadConfig.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'documentOne', maxCount: 1 }, { name: 'documentTwo', maxCount: 1 }]), employeeController.updateEncrypt);

	app.post('/api/designation', [authJwt.verifyToken], designationController.create);

	app.get('/api/designation', [authJwt.verifyToken], designationController.get);

	app.put('/api/designation/:id', [authJwt.verifyToken], designationController.update);

	app.put('/api/designation/delete/deleteSelected', [authJwt.verifyToken], designationController.deleteSelected);

	app.put('/api/designation/delete/:id', [authJwt.verifyToken], designationController.delete);

	app.post('/api/societyBoardMember', [authJwt.verifyToken], societyBoardMemberController.createEncrypted);

	app.get('/api/societyBoardMember', [authJwt.verifyToken], societyBoardMemberController.getDecrypted);

	app.put('/api/societyBoardMember/:id', [authJwt.verifyToken], societyBoardMemberController.updateEncrypted);

	app.put('/api/societyBoardMember/delete/deleteSelected', [authJwt.verifyToken], societyBoardMemberController.deleteSelected);

	app.put('/api/societyBoardMember/delete/:id', [authJwt.verifyToken], societyBoardMemberController.delete);

	app.post('/api/relation', [authJwt.verifyToken], relationController.create);

	app.get('/api/relation', [authJwt.verifyToken], relationController.get);

	app.put('/api/relation/:id', [authJwt.verifyToken], relationController.update);

	app.put('/api/relation/delete/deleteSelected', [authJwt.verifyToken], relationController.deleteSelected);

	app.put('/api/relation/delete/:id', [authJwt.verifyToken], relationController.delete);

	app.post('/api/societyMemberEvent', [authJwt.verifyToken], societyMemberEvent.create);

	app.get('/api/societyMemberEvent', [authJwt.verifyToken], societyMemberEvent.get);

	app.put('/api/societyMemberEvent/delete/deleteSelected', [authJwt.verifyToken], societyMemberEvent.deleteSelected);

	app.put('/api/societyMemberEvent/delete/:id', [authJwt.verifyToken], societyMemberEvent.delete);

	app.put('/api/societyMemberEvent/:id', [authJwt.verifyToken], societyMemberEvent.update);

	app.post('/api/owner', [authJwt.verifyToken], owner.create1);

	app.post('/api/owner/ownerMember/:id', [authJwt.verifyToken], owner.addMember);

	app.get('/api/owner', [authJwt.verifyToken], owner.get1);

	app.put('/api/owner/:id', [authJwt.verifyToken], owner.update1);

	app.get('/api/owner/:id', [authJwt.verifyToken], owner.getFlatNo);

	app.get('/api/owner/ownerMember/:id', [authJwt.verifyToken], owner.getMembers);

	app.get('/api/owner/getFlatDetail/:id', [authJwt.verifyToken], owner.getFlatDetail);

	app.put('/api/owner/delete/deleteSelected', [authJwt.verifyToken], owner.deleteSelected);

	app.put('/api/ownerMember/delete/deleteSelected', [authJwt.verifyToken], owner.deleteSelectedMembers);

	app.put('/api/owner/ownerMember/update/:id', [authJwt.verifyToken], owner.updateMember);

	app.put('/api/owner/delete/:id', [authJwt.verifyToken], owner.delete);

	//app.put('/api/ownerMember/deleteSelected',[authJwt.verifyToken],owner.delete);

	app.put('/api/ownerMember/delete/:id', [authJwt.verifyToken], owner.deleteMember);

	app.post('/api/tenant', [authJwt.verifyToken], tenant.createEncrypted);

	app.get('/api/tenant', [authJwt.verifyToken], tenant.getDecrypted);

	app.put('/api/tenant/delete/deleteSelected', [authJwt.verifyToken], tenant.deleteSelected);

	app.put('/api/tenant/delete/:id', [authJwt.verifyToken], tenant.delete);

	app.put('/api/tenant/:id', [authJwt.verifyToken], tenant.updateEncrypted);

	app.get('/api/tenant/members/:id', [authJwt.verifyToken], tenant.getTenantMembers);

	app.post('/api/tenant/members', [authJwt.verifyToken], tenant.addTenantMembers);

	app.put('/api/tenant/members/delete/deleteSelected', [authJwt.verifyToken], tenant.deleteSelectedTenantMembers);

	app.put('/api/tenant/members/delete/:id', [authJwt.verifyToken], tenant.deleteTenantMember);

	app.put('/api/tenant/members/:id', [authJwt.verifyToken], tenant.editTenantMembers);

	app.post('/api/societyMemberEventBooking', [authJwt.verifyToken], societyMemberEventBooking.create);

	app.get('/api/societyMemberEventBooking', [authJwt.verifyToken], societyMemberEventBooking.get);

	app.put('/api/societyMemberEventBooking/delete/deleteSelected', [authJwt.verifyToken], societyMemberEventBooking.deleteSelected);

	app.put('/api/societyMemberEventBooking/delete/:id', [authJwt.verifyToken], societyMemberEventBooking.delete);

	app.put('/api/societyMemberEventBooking/:id', [authJwt.verifyToken], societyMemberEventBooking.update);

	app.post('/api/eventSpaceMaster', [authJwt.verifyToken], eventSpaceController.create);

	app.get('/api/eventSpaceMaster', [authJwt.verifyToken], eventSpaceController.get);

	app.put('/api/eventSpaceMaster/:id', [authJwt.verifyToken], eventSpaceController.update);

	app.put('/api/eventSpaceMaster/delete/deleteSelected', [authJwt.verifyToken], eventSpaceController.deleteSelected);

	app.put('/api/eventSpaceMaster/delete/:id', [authJwt.verifyToken], eventSpaceController.delete);

	app.post('/api/floor', [authJwt.verifyToken], floor.create);

	app.get('/api/floor', [authJwt.verifyToken], floor.get);

	app.put('/api/floor/:id', [authJwt.verifyToken], floor.update);

	app.put('/api/floor/delete/deleteSelected', [authJwt.verifyToken], floor.deleteSelected);

	app.put('/api/floor/delete/:id', [authJwt.verifyToken], floor.delete);

	app.post('/api/ownerActivation', otpChecker.checkOtp);

	app.post('/api/checkToken', checkToken.checkToken);


}