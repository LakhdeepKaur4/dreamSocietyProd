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
	const vendorController = require('../controller/vendor');
	const serviceController = require('../controller/service');
	const sizeController = require('../controller/size');
	const messageController = require('../controller/message');
	const eventController = require('../controller/event');
	const serviceDetailController = require('../controller/serviceDetail');
	const parkingController = require('../controller/parking');
	const slotController = require('../controller/slot');
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
	const eventBooking = require('../controller/eventBooking');
	const individualVendorController = require('../controller/individualVendor');
	const complaint = require('../controller/complaint');
	const ownerPermission = require('../controller/ownerPermission');
	const machine = require('../controller/machine');
	const machineDetail = require('../controller/machineDetail');
	const rfidController = require('../controller/rfid');


	app.get('/', userController.start);

	app.get('/test', [authJwt.isSuperAdminRole], userController.test);

	app.post('/api/auth/signup', [verifySignUp.checkRolesExisted], userController.signupEncrypted);

	app.post('/api/auth/signin', userController.signinDecrypted);

	app.get('/api/user', userController.getUserDecrypted);

	app.get('/api/rolesAssigned', [authJwt.verifyToken, authJwt.isAdminRole], userController.getUserRoleDecrypted);

	app.post('/api/assignRoles', [authJwt.verifyToken, authJwt.isAdminRole], userController.assignRoles);

	app.get('/api/person', [authJwt.verifyToken, authJwt.isAdminRole], userController.getPersonDecrypted);

	app.get('/api/user/search', userController.search);

	// app.get('/api/user/test', [authJwt.verifyToken], userController.userContent);

	app.get('/api/user/userRole', [authJwt.verifyToken, authJwt.isAdminRole], userController.roleTest);

	app.get('/api/user/role', [authJwt.verifyToken, authJwt.isAdminRole], userController.role);

	app.get('/api/user/role/assign', [authJwt.verifyToken, authJwt.isAdminRole], userController.rolesToAssign);

	app.get('/api/user/deactive/:id', [authJwt.verifyToken, authJwt.isAdminRole], userController.deactiveUsersByRole);

	app.put('/api/user/deactivate/user', [authJwt.verifyToken, authJwt.isAdminRole], userController.deactivateUsers);

	app.put('/api/user/activate', [authJwt.verifyToken, authJwt.isAdminRole], userController.activateUsers);

	app.put('/api/user/multiple/deactivate', [authJwt.verifyToken, authJwt.isAdminRole], userController.multipleDeactivateUsers);

	app.put('/api/user/multiple/activate', [authJwt.verifyToken, authJwt.isAdminRole], userController.multipleActivateUsers);

	app.get('/api/role/assign', [authJwt.verifyToken, authJwt.isAdminRole], userController.getRolesToAssign);

	app.get('/api/user/role/activate', [authJwt.verifyToken, authJwt.isAdminRole], userController.getRolesForActivation);

	app.get('/api/user/active/:id', [authJwt.verifyToken, authJwt.isAdminRole], userController.activeUsersByRole);

	app.put('/api/user/:id', [authJwt.verifyToken, authJwt.isAdminRole], userController.updateEncrypted);

	app.get('/api/user/:id', userController.getById);

	app.post('/api/user/changePassword', [authJwt.verifyToken, isAdminRole], userController.changePassword);

	app.get('/api/forgotPassword/:userName', userController.forgottenPassword);

	app.post('/api/otpVerify', userController.otpVerify);

	app.get('/api/tokenVerify/:url', userController.tokenVerify)

	app.post('/api/resetPassword', userController.resetPassword);

	app.put('/api/user/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], userController.deleteSelected);

	app.put('/api/user/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], userController.delete);

	app.get('/api/test/owner', [authJwt.verifyToken, authJwt.isOwnerOrTenant], userController.managementBoard);

	app.get('/api/test/admin', [authJwt.verifyToken, authJwt.isAdmin], userController.adminBoard);

	app.post('/api/city', [authJwt.verifyToken, authJwt.isAdminRole], cityController.create);

	app.get('/api/city', [authJwt.verifyToken, authJwt.isAdminRole], cityController.get);

	app.get('/api/city/:id', [authJwt.verifyToken, authJwt.isAdminRole], cityController.getById);

	app.put('/api/city/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], cityController.deleteSelected);

	app.put('/api/city/:id', [authJwt.verifyToken, authJwt.isAdminRole], cityController.update);

	// app.delete('/api/city/:id',[authJwt.verifyToken],cityController.deleteById);

	app.delete('/api/city/:id', [authJwt.verifyToken, authJwt.isAdminRole], cityController.deleteById)

	app.put('/api/city/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], cityController.delete);

	app.delete('/api/city/:id', [authJwt.verifyToken, authJwt.isAdminRole], cityController.delete);

	app.post('/api/country', [authJwt.verifyToken, authJwt.isAdminRole], countryController.create);

	app.get('/api/country', [authJwt.verifyToken, authJwt.isAdminRole], countryController.get);

	app.get('/api/country/:id', [authJwt.verifyToken, authJwt.isAdminRole], countryController.getById);

	app.put('/api/country/:id', [authJwt.verifyToken, authJwt.isAdminRole], countryController.update);

	app.put('/api/country/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], countryController.deleteSelected);

	app.put('/api/country/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], countryController.delete);

	app.post('/api/state', [authJwt.verifyToken, authJwt.isAdminRole], stateController.create);

	app.get('/api/state', [authJwt.verifyToken, authJwt.isAdminRole], stateController.get);

	app.get('/api/state/:id', [authJwt.verifyToken, authJwt.isAdminRole], stateController.getById);

	app.put('/api/state/:id', [authJwt.verifyToken, authJwt.isAdminRole], stateController.update);

	app.put('/api/state/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], stateController.deleteSelected);

	app.put('/api/state/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], stateController.delete);

	app.post('/api/location', [authJwt.verifyToken, authJwt.isAdminRole], locationController.create);

	app.get('/api/location', [authJwt.verifyToken, authJwt.isAdminRole], locationController.get);

	app.get('/api/location/:id', [authJwt.verifyToken, authJwt.isAdminRole], locationController.getById);

	app.put('/api/location/:id', [authJwt.verifyToken, authJwt.isAdminRole], locationController.update);

	app.put('/api/location/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], locationController.deleteSelected);

	app.put('/api/location/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], locationController.delete);

	app.post('/api/society', [authJwt.verifyToken, authJwt.isAdminRole], societyController.createEncrypted);

	app.get('/api/society', [authJwt.verifyToken, authJwt.isAdminRole], societyController.getDecrypted);

	app.get('/api/society/:id', [authJwt.verifyToken, authJwt.isAdminRole], societyController.getByIdDecrypted);

	app.put('/api/society/:id', [authJwt.verifyToken, authJwt.isAdminRole], societyController.updateEncrypted);

	app.put('/api/society/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], societyController.deleteSelected);

	app.put('/api/society/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], societyController.delete);

	app.post('/api/tower', [authJwt.verifyToken, authJwt.isAdminRole], towerController.create);

	app.get('/api/tower', [authJwt.verifyToken, authJwt.isAdminRole], towerController.get);

	app.get('/api/towerFloor', [authJwt.verifyToken, authJwt.isAdminRole], towerController.getTowerAndFloor);

	app.get('/api/tower/towerFloor/:id', [authJwt.verifyToken, authJwt.isAdminRole], towerController.getFloorByTowerIdForTenant);

	app.get('/api/towerFloor/:id', [authJwt.verifyToken, authJwt.isAdminRole], towerController.getFloorByTowerId);

	app.put('/api/towerFloor/update/:id', [authJwt.verifyToken, authJwt.isAdminRole], towerController.update);

	app.get('/api/tower/:id', [authJwt.verifyToken, authJwt.isAdminRole], towerController.getById);

	app.put('/api/tower/:id', [authJwt.verifyToken, authJwt.isAdminRole], towerController.update);

	app.put('/api/tower/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], towerController.deleteSelected);

	app.put('/api/tower/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], towerController.delete);

	app.post('/api/flat', [authJwt.verifyToken, authJwt.isAdminRole], flatController.create);

	app.get('/api/flat', [authJwt.verifyToken, authJwt.isAdminRole], flatController.get);

	app.put('/api/flat/:id', [authJwt.verifyToken, authJwt.isAdminRole], flatController.update);

	app.get('/api/flat/pagination/:page', [authJwt.verifyToken, authJwt.isAdminRole], flatController.getFlatByPageNumber);

	app.put('/api/flat/limit/:page', [authJwt.verifyToken, authJwt.isAdminRole], flatController.getFlatByLimit);

	app.get('/api/flat/test', [authJwt.verifyToken, authJwt.isAdminRole], flatController.getFlatByLimit);

	app.get('/api/flat/:id', flatController.getById);

	app.put('/api/flat/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], flatController.deleteSelected);

	app.put('/api/flat/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], flatController.delete);

	app.post('/api/service', [authJwt.verifyToken, authJwt.isAdminRole], serviceController.create);

	app.get('/api/service', [authJwt.verifyToken, authJwt.isAdminRole], serviceController.get);

	app.get('/api/vendor/service', [authJwt.verifyToken, authJwt.isOwnerOrTenantRole], serviceController.get);

	app.get('/api/service/:id', [authJwt.verifyToken, authJwt.isAdminRole], serviceController.getById);

	app.put('/api/service/:id', [authJwt.verifyToken, authJwt.isAdminRole], serviceController.update);

	app.put('/api/service/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], serviceController.deleteSelected);

	app.put('/api/service/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], serviceController.delete);

	app.post('/api/size', [authJwt.verifyToken, authJwt.isAdminRole], sizeController.create);

	app.get('/api/size', [authJwt.verifyToken, authJwt.isAdminRole], sizeController.get);

	app.get('/api/size/:id', [authJwt.verifyToken, authJwt.isAdminRole], sizeController.getById);

	app.put('/api/size/:id', [authJwt.verifyToken, authJwt.isAdminRole], sizeController.update);

	app.put('/api/size/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], sizeController.deleteSelected);

	app.put('/api/size/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], sizeController.delete);

	app.post('/api/event', [authJwt.verifyToken, authJwt.isAdminRole], eventController.create);

	app.get('/api/event', [authJwt.verifyToken, authJwt.isAdminRole], eventController.get);

	app.put('/api/event/:id', [authJwt.verifyToken, authJwt.isAdminRole], eventController.update);

	app.put('/api/event/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], eventController.deleteSelected);

	app.put('/api/event/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], eventController.delete);

	app.post('/api/sendMessage', [authJwt.verifyToken, authJwt.isAdminRole], messageController.sendMessage);

	app.post('/api/serviceDetail', [authJwt.verifyToken, authJwt.isAdminRole], serviceDetailController.create);

	app.get('/api/serviceDetail', [authJwt.verifyToken, authJwt.isAdminRole], serviceDetailController.get);

	app.get('/api/eventOrganiser', [authJwt.verifyToken, authJwt.isAdminRole], eventController.getEventOrganiser);

	app.post('/api/parking', [authJwt.verifyToken, authJwt.isAdminRole], parkingController.create);

	app.get('/api/parking', [authJwt.verifyToken, authJwt.isAdminRole], parkingController.get);

	app.post('/api/slot', [authJwt.verifyToken, authJwt.isAdminRole], slotController.create);

	app.get('/api/slot/:parkingId/:flatId', [authJwt.verifyToken, authJwt.isAdminRole], slotController.get);

	app.get('/api/slot', [authJwt.verifyToken, authJwt.isAdminRole], slotController.getSlot);

	// app.get('/api/getSlot',slotController.getslots);

	app.get('/api/getState/:id', [authJwt.verifyToken, authJwt.isAdminRole], stateController.getCountry);

	// app.post('/api/vendor', [authJwt.verifyToken] ,vendorController.create);

	app.post('/api/vendor', [authJwt.verifyToken, authJwt.isAdminRole], fileUploadConfig.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'documentOne', maxCount: 1 }, { name: 'documentTwo', maxCount: 1 }]), vendorController.create1);

	app.get('/api/vendor', [authJwt.verifyToken, authJwt.isAdminRole], vendorController.get1);

	app.put('/api/vendor/:id', [authJwt.verifyToken], fileUploadConfig.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'documentOne', maxCount: 1 }, { name: 'documentTwo', maxCount: 1 }]), vendorController.update1);

	app.put('/api/vendor/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole, authJwt.isAdminRole], vendorController.deleteSelected);

	app.put('/api/vendor/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole, authJwt.isAdminRole], vendorController.delete);

	app.put('/api/vendorService/:id', [authJwt.verifyToken, authJwt.isAdminRole, authJwt.isAdminRole], vendorController.updateVendorService);

	app.put('/api/vendorService/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole, authJwt.isAdminRole], vendorController.deleteSelectedVendorServices);

	app.put('/api/vendorService/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole, authJwt.isAdminRole], vendorController.deleteVendorService);

	app.post('/api/assets', [authJwt.verifyToken, authJwt.isAdminRole, authJwt.isAdminRole], assetsController.create);

	app.get('/api/assets', [authJwt.verifyToken, authJwt.isAdminRole, authJwt.isAdminRole], assetsController.get);

	app.get('/api/assets/:page', [authJwt.verifyToken, authJwt.isAdminRole], assetsController.getAssetsByPageNumber);

	app.put('/api/assets/:id', [authJwt.verifyToken, authJwt.isAdminRole], assetsController.update);

	app.put('/api/assets/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], assetsController.deleteSelected);

	app.put('/api/assets/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], assetsController.delete);

	app.delete('/api/assets/:id', [authJwt.verifyToken, authJwt.isAdminRole], assetsController.deleteById);

	app.post('/api/assetsType', [authJwt.verifyToken, authJwt.isAdminRole], assetsTypeController.create);

	app.get('/api/assetsType/', [authJwt.verifyToken, authJwt.isAdminRole], assetsTypeController.get);

	app.get('/api/assetsType/:page', [authJwt.verifyToken, authJwt.isAdminRole], assetsTypeController.getAssetsTypeByPageNumber);

	app.put('/api/assetsType/:id', [authJwt.verifyToken, authJwt.isAdminRole], assetsTypeController.update);

	app.delete('/api/assetsType/:id', [authJwt.verifyToken, authJwt.isAdminRole], assetsTypeController.deleteById);

	app.put('/api/assetsType/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], assetsTypeController.deleteSelected);

	app.put('/api/assetsType/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], assetsTypeController.delete);

	app.post('/api/user/encrypt', userController.encryptData);

	app.post('/api/auth/signupCopy', [verifySignUp.checkRolesExisted], userController.signupCopy);

	app.post('/api/flatDetail', [authJwt.verifyToken, authJwt.isAdminRole], flatDetailController.create);

	app.get('/api/flatDetail/:id', [authJwt.verifyToken, authJwt.isAdminRole], flatDetailController.getSlot);

	app.get('/api/flatDetailForOwner/:id', [authJwt.verifyToken, authJwt.isAdminRole], flatDetailController.getSlotNew);

	app.get('/api/flatDetail', [authJwt.verifyToken, authJwt.isAdminRole], flatDetailController.get);

	app.put('/api/flatDetail/:id', [authJwt.verifyToken, authJwt.isAdminRole], flatDetailController.update);

	app.put('/api/flatDetail/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], flatDetailController.deleteSelected);

	app.put('/api/flatDetail/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], flatDetailController.delete);

	app.post('/api/maintenance', [authJwt.verifyToken, authJwt.isAdminRole], maintenanceController.create);

	app.get('/api/maintenance', [authJwt.verifyToken, authJwt.isAdminRole], maintenanceController.get);

	app.put('/api/maintenance/:id', [authJwt.verifyToken, authJwt.isAdminRole], maintenanceController.update);

	app.put('/api/maintenance/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], maintenanceController.deleteSelected);

	app.put('/api/maintenance/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], maintenanceController.delete);

	app.post('/api/maintenanceType', [authJwt.verifyToken, authJwt.isAdminRole], maintenanceTypeController.create);

	app.put('/api/maintenanceType/:id', [authJwt.verifyToken, authJwt.isAdminRole], maintenanceTypeController.update);

	app.put('/api/maintenanceType/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], maintenanceTypeController.deleteSelected);

	app.put('/api/maintenanceType/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], maintenanceTypeController.delete);

	app.get('/api/maintenanceType', [authJwt.verifyToken, authJwt.isAdminRole], maintenanceTypeController.get);

	app.post('/api/rate', [authJwt.verifyToken, authJwt.isAdminRole], rateController.create);

	app.get('/api/rate', [authJwt.verifyToken, authJwt.isAdminRole], rateController.get);

	app.post('/api/employeeType', [authJwt.verifyToken, authJwt.isAdminRole], employeeTypeController.create);

	app.get('/api/employeeType', [authJwt.verifyToken, authJwt.isAdminRole], employeeTypeController.get);

	app.post('/api/employeeWorkType', [authJwt.verifyToken, authJwt.isAdminRole], employeeWorkTypeController.create);

	app.get('/api/employeeWorkType', [authJwt.verifyToken, authJwt.isAdminRole], employeeWorkTypeController.get);

	app.post('/api/employeeDetail', [authJwt.verifyToken, authJwt.isAdminRole], employeeDetailController.create);

	app.get('/api/employeeDetail', [authJwt.verifyToken, authJwt.isAdminRole], employeeDetailController.get);

	app.put('/api/employeeDetail/:id', [authJwt.verifyToken, authJwt.isAdminRole], employeeDetailController.update);

	app.put('/api/employeeDetail/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole, authJwt.isAdminRole], employeeDetailController.deleteSelected);

	app.put('/api/employeeDetail/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole, authJwt.isAdminRole], employeeDetailController.delete);

	app.post('/api/inventory', [authJwt.verifyToken, authJwt.isAdminRole], inventoryController.create);

	app.get('/api/inventory', [authJwt.verifyToken, authJwt.isAdminRole], inventoryController.get);

	app.get('/api/inventory/:id', [authJwt.verifyToken, authJwt.isAdminRole], inventoryController.getInventoryByAssetId);

	app.put('/api/inventory/:id', [authJwt.verifyToken, authJwt.isAdminRole], inventoryController.update);

	app.put('/api/inventory/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], inventoryController.deleteSelected);

	app.put('/api/inventory/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], inventoryController.delete);

	app.post('/api/employee', [authJwt.verifyToken, authJwt.isAdminRole], fileUploadConfig.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'documentOne', maxCount: 1 }, { name: 'documentTwo', maxCount: 1 }]), employeeController.createEncrypt);

	app.put('/api/employee/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], employeeController.deleteSelected);

	app.get('/api/employee', [authJwt.verifyToken, authJwt.isAdminRole], employeeController.getDecrypt);

	// app.put('/api/employee/:id',[authJwt.verifyToken],employeeController.update);

	app.put('/api/employee/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], employeeController.delete);

	app.put('/api/employee/:id', [authJwt.verifyToken, authJwt.isAdminRole], fileUploadConfig.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'documentOne', maxCount: 1 }, { name: 'documentTwo', maxCount: 1 }]), employeeController.updateEncrypt);

	app.post('/api/designation', [authJwt.verifyToken, authJwt.isAdminRole], designationController.create);

	app.get('/api/designation', [authJwt.verifyToken, authJwt.isAdminRole], designationController.get);

	app.put('/api/designation/:id', [authJwt.verifyToken, authJwt.isAdminRole], designationController.update);

	app.put('/api/designation/delete/deleteSelected', [authJwt.verifyToken], authJwt.isAdminRole, designationController.deleteSelected);

	app.put('/api/designation/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], designationController.delete);

	app.post('/api/societyBoardMember', [authJwt.verifyToken, authJwt.isAdminRole], societyBoardMemberController.createEncrypted);

	app.get('/api/societyBoardMember', [authJwt.verifyToken, authJwt.isAdminRole], societyBoardMemberController.getDecrypted);

	app.put('/api/societyBoardMember/:id', [authJwt.verifyToken, authJwt.isAdminRole], societyBoardMemberController.updateEncrypted);

	app.put('/api/societyBoardMember/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], societyBoardMemberController.deleteSelected);

	app.put('/api/societyBoardMember/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], societyBoardMemberController.delete);

	app.post('/api/relation', [authJwt.verifyToken, authJwt.isAdminRole], relationController.create);

	app.get('/api/relation', [authJwt.verifyToken, authJwt.isAdminRole], relationController.get);

	app.put('/api/relation/:id', [authJwt.verifyToken, authJwt.isAdminRole], relationController.update);

	app.put('/api/relation/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], relationController.deleteSelected);

	app.put('/api/relation/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], relationController.delete);

	app.post('/api/societyMemberEvent', [authJwt.verifyToken, authJwt.isAdminRole], societyMemberEvent.create);

	app.get('/api/societyMemberEvent', [authJwt.verifyToken, authJwt.isAdminRole], societyMemberEvent.get);

	app.put('/api/societyMemberEvent/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], societyMemberEvent.deleteSelected);

	app.put('/api/societyMemberEvent/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], societyMemberEvent.delete);

	app.put('/api/societyMemberEvent/:id', [authJwt.verifyToken, authJwt.isAdminRole], societyMemberEvent.update);

	app.post('/api/owner', [authJwt.verifyToken, authJwt.isAdminRole], owner.create1);

	app.post('/api/owner/ownerMember/:id', [authJwt.verifyToken, authJwt.isAdminRole], owner.addMember);

	app.get('/api/owner', [authJwt.verifyToken], owner.get2);

	app.put('/api/owner/:id', [authJwt.verifyToken, authJwt.isAdminRole], owner.update2);

	app.get('/api/owner/:id', [authJwt.verifyToken, authJwt.isAdminRole], owner.getFlatNo);

	app.get('/api/owner/ownerMember/:id', [authJwt.verifyToken, authJwt.isAdminRole], owner.getMembers);

	app.get('/api/owner/getFlatDetail/:id', [authJwt.verifyToken, authJwt.isAdminRole], owner.getFlatDetail);

	app.put('/api/owner/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], owner.deleteSelected);

	app.put('/api/ownerMember/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], owner.deleteSelectedMembers);

	app.put('/api/owner/ownerMember/update/:id', [authJwt.verifyToken, authJwt.isAdminRole], owner.updateMember);

	app.put('/api/owner/delete/:id', [authJwt.verifyToken], owner.delete);

	app.get('/api/owner/getFlats/:id', [authJwt.verifyToken], owner.getflats);

	app.post('/api/owner/addMoreFlats', [authJwt.verifyToken], owner.addMoreFlats);

	app.put('/api/owner/deleteFlat/:id', [authJwt.verifyToken], owner.deleteFlat);

	app.put('/api/owner/editFlat/:id', [authJwt.verifyToken], owner.editFlat);

	//app.put('/api/ownerMember/deleteSelected',[authJwt.verifyToken],owner.delete);

	app.put('/api/ownerMember/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], owner.deleteMember);

	app.post('/api/ownerPermission', ownerPermission.sendMailToTenant);

	app.post('/api/tenant', [authJwt.verifyToken, authJwt.isAdminRole], tenant.createEncrypted);

	app.get('/api/tenant', [authJwt.verifyToken, authJwt.isAdminRole], tenant.getDecrypted);

	app.post('/api/tenant/addFlat', [authJwt.verifyToken, isAdminRole], tenant.addFlats);

	app.get('/api/tenant/getFlats/:id', [authJwt.verifyToken, isAdminRole], tenant.getFlats);

	app.put('/api/tenant/editFlat', [authJwt.verifyToken, isAdminRole], tenant.editFlat);

	app.put('/api/tenant/deleteFlat', [authJwt.verifyToken, isAdminRole], tenant.deleteFlat);

	app.put('/api/tenant/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], tenant.deleteSelected);

	app.put('/api/tenant/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], tenant.delete);

	app.put('/api/tenant/:id', [authJwt.verifyToken, authJwt.isAdminRole], tenant.updateEncrypted);

	app.get('/api/tenant/members/:id', [authJwt.verifyToken, authJwt.isAdminRole], tenant.getTenantMembers);

	app.post('/api/tenant/members', [authJwt.verifyToken, authJwt.isAdminRole], tenant.addTenantMembers);

	app.put('/api/tenant/members/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], tenant.deleteSelectedTenantMembers);

	app.put('/api/tenant/members/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], tenant.deleteTenantMember);

	app.put('/api/tenant/members/:id', [authJwt.verifyToken, authJwt.isAdminRole], tenant.editTenantMembers);

	app.post('/api/societyMemberEventBooking', [authJwt.verifyToken, authJwt.isAdminRole], societyMemberEventBooking.create);

	app.get('/api/societyMemberEventBooking', [authJwt.verifyToken, authJwt.isAdminRole], societyMemberEventBooking.get);

	app.put('/api/societyMemberEventBooking/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], societyMemberEventBooking.deleteSelected);

	app.put('/api/societyMemberEventBooking/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], societyMemberEventBooking.delete);

	app.put('/api/societyMemberEventBooking/:id', [authJwt.verifyToken, authJwt.isAdminRole], societyMemberEventBooking.update);

	app.post('/api/eventSpaceMaster', [authJwt.verifyToken, authJwt.isAdminRole], eventSpaceController.create);

	app.get('/api/eventSpaceMaster', [authJwt.verifyToken, authJwt.isAdminRole], eventSpaceController.get);

	app.put('/api/eventSpaceMaster/:id', [authJwt.verifyToken, authJwt.isAdminRole], eventSpaceController.update);

	app.put('/api/eventSpaceMaster/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], eventSpaceController.deleteSelected);

	app.put('/api/eventSpaceMaster/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], eventSpaceController.delete);

	app.post('/api/floor', [authJwt.verifyToken, authJwt.isAdminRole], floor.create);

	app.get('/api/floor', [authJwt.verifyToken, authJwt.isAdminRole], floor.get);

	app.put('/api/floor/:id', [authJwt.verifyToken, authJwt.isAdminRole], floor.update);

	app.put('/api/floor/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], floor.deleteSelected);

	app.put('/api/floor/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], floor.delete);

	app.post('/api/ownerActivation', otpChecker.checkOtp);

	app.post('/api/checkToken', checkToken.checkToken);

	app.post('/api/createEventBooking', [authJwt.verifyToken, authJwt.isAdminRole], eventBooking.create);

	app.get('/api/getEventBookings', [authJwt.verifyToken, authJwt.isAdminRole], eventBooking.get);

	app.put('/api/updateEventBookings/:id', [authJwt.verifyToken, authJwt.isAdminRole], eventBooking.update);

	app.put('/api/deleteEventBooking/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], eventBooking.deleteSelected);

	app.put('/api/deleteEventBooking/:id', [authJwt.verifyToken, authJwt.isAdminRole], eventBooking.delete);

	app.post('/api/individualVendor', [authJwt.verifyToken, authJwt.isAdminRole], individualVendorController.create);

	app.get('/api/individualVendor', [authJwt.verifyToken, authJwt.isAdminRole], individualVendorController.get);

	app.get('/api/individualVendor/:id', [authJwt.verifyToken, authJwt.isAdminRole], individualVendorController.getById);

	app.put('/api/individualVendor/:id', [authJwt.verifyToken, authJwt.isAdminRole], individualVendorController.update);

	app.put('/api/individualVendor/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], individualVendorController.deleteSelected);

	app.put('/api/individualVendor/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], individualVendorController.delete);

	app.get('/api/flatbyid', [authJwt.verifyToken, authJwt.isOwnerOrTenantRole], userController.flatByUserId);

	app.post('/api/complaintRegister', [authJwt.verifyToken, authJwt.isOwnerOrTenantRole], complaint.create);

	app.get('/api/complaintRegister', [authJwt.verifyToken, authJwt.isOwnerOrTenantRole], complaint.get);

	app.get('/api/machine', [authJwt.verifyToken, authJwt.isAdminRole], machine.get);

	app.post('/api/machine', [authJwt.verifyToken, authJwt.isAdminRole], machine.create);
	
	app.put('/api/machine/:id', [authJwt.verifyToken, authJwt.isAdminRole], machine.update);

	app.put('/api/machine/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], machine.deleteSelected);

	app.put('/api/machine/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], machine.delete);

	app.get('/api/machineDetail', [authJwt.verifyToken, authJwt.isAdminRole], machineDetail.get);

	app.post('/api/machineDetail', [authJwt.verifyToken, authJwt.isAdminRole], machineDetail.create);

	app.put('/api/machineDetail/:id', [authJwt.verifyToken, authJwt.isAdminRole], machineDetail.update);

	app.put('/api/machineDetail/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], machineDetail.deleteSelected);

	app.put('/api/machineDetail/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], machineDetail.delete);

	app.get('/api/rfid', [authJwt.verifyToken, authJwt.isAdminRole], rfidController.get);

	app.post('/api/rfid', [authJwt.verifyToken, authJwt.isAdminRole], rfidController.create);

	app.put('/api/rfid/:id', [authJwt.verifyToken, authJwt.isAdminRole], rfidController.update);

	app.put('/api/rfid/delete/deleteSelected', [authJwt.verifyToken, authJwt.isAdminRole], rfidController.deleteSelected);

	app.put('/api/rfid/delete/:id', [authJwt.verifyToken, authJwt.isAdminRole], rfidController.delete);
}
