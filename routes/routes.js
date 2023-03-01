var express = require('express');
var Routes = express.Router();
var permitType_ctrl = require('../controllers/permitType_ctrl');
var auth_ctrl = require('../controllers/auth_ctrl');
var city_ctrl = require('../controllers/city_ctrl');
var rate_ctrl = require('../controllers/rate_ctrl');
var plate_ctrl = require('../controllers/plate_ctrl');
var dashboard_ctrl = require('../controllers/dashboard_ctrl');
var business_plate_ctrl = require('../controllers/business_plate_ctrl');
var taxRates_ctrl = require('../controllers/taxRates_ctrl');
var organizations_ctrl = require('../controllers/organizations_ctrl');
var parking_ctrl = require('../controllers/parking_ctrl');
var user_ctrl = require('../controllers/user_ctrl');
var ticket_ctrl = require('../controllers/ticket_ctrl');
var ticket_issue_ctrl = require('../controllers/ticket_issue_ctrl');
var agent_permissions_ctrl = require('../controllers/agent_permissions_ctrl');
var reporting_ctrl = require('../controllers/reporting_ctrl');
const { authorization } = require('../helpers/auth_helper');
const { upload } = require('../helpers/common_helper');

var organizationsFile = [
    { name: 'header_logo', maxCount: 1 },
    { name: 'footer_logo', maxCount: 1 },
    { name: 'receipt_logo', maxCount: 1 },
]

Routes.route('/').get(function (req, res){
    console.log('main');
    res.send('main');
});

//routes for auth
Routes.route('/signup').post(auth_ctrl.signup);
Routes.route('/verify').post(auth_ctrl.verify);
Routes.route('/login').post(auth_ctrl.login);
Routes.route('/forgetPassword').post(auth_ctrl.forgetPassword);
Routes.route('/changePassword').post(auth_ctrl.changePassword);
Routes.route('/agent_login').post(auth_ctrl.agent_login);

Routes.route('/testGetUser').get(auth_ctrl.testGetUser);
Routes.route('/testAddUser').get(auth_ctrl.testAddUser);
// Routes.route('/resetPassword').post(auth_ctrl.resetPassword);


//routes for city_zones
Routes.route('/addCity').post(city_ctrl.addCity);
Routes.route('/addZone').post(city_ctrl.addZone);
Routes.route('/getCities').get(city_ctrl.getCities);
Routes.route('/getZones').get(city_ctrl.getZones);
Routes.route('/getZonesById').post(city_ctrl.getZonesById);
Routes.route('/getZonebyId').post(city_ctrl.getZonebyId);
Routes.route('/editZone').post(city_ctrl.editZone);
Routes.route('/delZone').post(city_ctrl.delZone);
Routes.route('/getVisitorZone').post(city_ctrl.getVisitorZone);


//routes for rate
Routes.route('/addRate').post(rate_ctrl.addRate);
Routes.route('/getRateById').post(rate_ctrl.getRateById);
Routes.route('/getRates').get(rate_ctrl.getRates);
Routes.route('/addRateType').post(rate_ctrl.addRateType);
Routes.route('/getRateTypes').get(rate_ctrl.getRateTypes);
Routes.route('/addRateStep').post(rate_ctrl.addRateStep);
Routes.route('/getRateSteps').post(rate_ctrl.getRateSteps);
Routes.route('/getRateDetail').post(rate_ctrl.getRateDetail);
Routes.route('/getQRRateById').post(rate_ctrl.getQRRateById);
Routes.route('/editRate').post(rate_ctrl.editRate);
Routes.route('/delRate').post(rate_ctrl.delRate);
Routes.route('/editRateType').post(rate_ctrl.editRateType);
Routes.route('/editRateStep').post(rate_ctrl.editRateStep);
Routes.route('/delRateType').post(rate_ctrl.delRateType);
Routes.route('/delRateStep').post(rate_ctrl.delRateStep);
Routes.route('/getAllSteps').get(rate_ctrl.getAllSteps);
Routes.route('/bulkEditSteps').post(rate_ctrl.bulkEditSteps);

//routes for plate
Routes.route('/getPlatesByUser').post(plate_ctrl.getPlatesByUser);
Routes.route('/addPlate').post(plate_ctrl.addPlate);
Routes.route('/delPlate').post(plate_ctrl.delPlate);
Routes.route('/editPlate').post(plate_ctrl.editPlate);

//routes for busniess_plate
Routes.route('/getBusinessPlate').get(business_plate_ctrl.getBusinessPlate);
Routes.route('/addBusinessPlate').post(business_plate_ctrl.addBusinessPlate);
Routes.route('/delBusinessPlate').post(business_plate_ctrl.delBusinessPlate);
Routes.route('/editBusinessPlate').post(business_plate_ctrl.editBusinessPlate);

//routes for dashboard
Routes.route('/getDashboard').get(dashboard_ctrl.getDashboard);

//routes for tax_rates
Routes.route('/getTaxRates').get(authorization, taxRates_ctrl.getTaxRates);
Routes.route('/addTaxRates').post(authorization, taxRates_ctrl.addTaxRates);

//routes for organizations
Routes.route('/getOrganizations').get(authorization, organizations_ctrl.getOrganizations);
Routes.route('/addOrganizations').post([authorization,upload.fields(organizationsFile)], organizations_ctrl.addOrganizations);

//routes for parking
Routes.route('/buyParking').post(parking_ctrl.buyParking);
Routes.route('/getParkings').post(parking_ctrl.getParkings);
Routes.route('/emailReciept').post(parking_ctrl.emailReciept);
Routes.route('/getUserHistory').post(parking_ctrl.getUserHistory);
Routes.route('/mobileParking').post(parking_ctrl.mobileParking);
Routes.route('/getCurrentParking').post(parking_ctrl.getCurrentParking);
Routes.route('/getCurrentParkingsByPlate').post(parking_ctrl.getCurrentParkingsByPlate);
Routes.route('/editParking').post(parking_ctrl.editParking);
Routes.route('/delAllParkings').post(parking_ctrl.delAllParkings);
Routes.route('/getParkingStatus').post(parking_ctrl.getParkingStatus);

//routes for users
Routes.route('/getUsers').get(user_ctrl.getUsers);
Routes.route('/delItem').post(user_ctrl.delItem);
Routes.route('/addUser').post(user_ctrl.addUser);
Routes.route('/editUser').post(user_ctrl.editUser);
Routes.route('/getUserProfile').post(user_ctrl.getUserProfile);
Routes.route('/editProfile').post(user_ctrl.editProfile);
Routes.route('/getAgents').get(user_ctrl.getAgents);

//routes for tickets
Routes.route('/getTickets').post(ticket_ctrl.getTickets);
Routes.route('/addTicket').post(ticket_ctrl.addTicket);
Routes.route('/delTicket').post(ticket_ctrl.delTicket);
Routes.route('/editTicket').post(ticket_ctrl.editTicket);
Routes.route('/getAgingByTicket').post(ticket_ctrl.getAgingByTicket);
Routes.route('/editAllTicket').post(ticket_ctrl.editAllTicket);


//routes for tickets_issued
Routes.route('/IssueTicket').post(ticket_issue_ctrl.IssueTicket);
Routes.route('/getTicketsIssued').post(ticket_issue_ctrl.getTicketsIssued);
Routes.route('/getTicketsIssuedByAgent').post(ticket_issue_ctrl.getTicketsIssuedByAgent);
Routes.route('/editIssueTicket').post(ticket_issue_ctrl.editIssueTicket);
Routes.route('/searchTicket').post(ticket_issue_ctrl.searchTicket);
Routes.route('/payTicket').post(ticket_issue_ctrl.payTicket);


//routes for agent_permissions
Routes.route('/getAgentPermissions').post(agent_permissions_ctrl.getAgentPermissions);

//routes for Reporting
Routes.route('/generateReport').post(reporting_ctrl.generateReport);
Routes.route('/exportPDF').post(reporting_ctrl.exportPDF);
Routes.route('/generateTicketIssuedReport').post(reporting_ctrl.generateTicketIssuedReport);
Routes.route('/exportTicketIssuedPDF').post(reporting_ctrl.exportTicketIssuedPDF);

module.exports = Routes;