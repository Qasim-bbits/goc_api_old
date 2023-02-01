const { Parkings } = require('../models/parking_model');
const { Ticket_Issued } = require('../models/ticket_issued_model');
const stripe = require("stripe")(process.env.SECRET_KEY);
var email_helper = require('../helpers/email_helper');

const moment = require('moment-timezone');
moment.tz.setDefault("America/New_York");

module.exports.buyParking = async function(req,res){
    if(req.body.amount == 0){
      req.body.from = moment(req.body.from, 'MMMM Do YYYY, hh:mm a' ).format()
      req.body.to = moment(req.body.to, 'MMMM Do YYYY, hh:mm a' ).format()
      req.body.parking_id = Math.floor(100000 + Math.random() * 900000)
      const parkings = new Parkings(req.body);
      parkings.save();
      res.send(parkings);
    }else{
      try {
	console.log(req.body);
        const payment = await stripe.paymentIntents.create({
          amount: parseFloat(req.body.amount),
          currency: "CAD",
          description: req.body.plate + " is parked from " + req.body.from + " to " + req.body.to,
          payment_method: req.body.paymentMethod.id,
          confirm: true,
        });
        req.body.paymentMethod = payment.payment_method;
        req.body.from = moment(req.body.from, 'MMMM Do YYYY, hh:mm a' ).format()
        req.body.to = moment(req.body.to, 'MMMM Do YYYY, hh:mm a' ).format()
        req.body.parking_id = Math.floor(100000 + Math.random() * 900000)
        const parkings = new Parkings(req.body);
        parkings.save();
        res.send(parkings);
      } catch (e) {
        switch (e.type) {
          case 'StripeCardError':
            res.json({
              message: e.message,
              status: 'error',
            });
            break;
          case 'StripeInvalidRequestError':
            res.json({
              message: 'An invalid request occurred.',
              status: 'error',
            });
            break;
          default:
            res.json({
              message: 'Another problem occurred, maybe unrelated to Stripe.',
              status: 'error',
            });
            break;
        }
      }
    }
}

module.exports.getParkings = async function(req,res){
  try {
    let parkings = await Parkings.
    find(req.body).
    sort({_id: -1}).
    populate('city').
    populate('user').
    populate('zone').
    populate('rate');
    res.send(parkings);
  } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
  }
}

module.exports.emailReciept = async function(req,res){
  try {
    let parkings = await Parkings.
    find({_id: req.body.parking_id}).
    populate('city').
    populate('user').
    populate('rate').
    populate('zone');
    if(parkings.length > 0){
      let emailBody = {
        startDate : moment(parkings[0].from).format('ll'),
        startTime : moment(parkings[0].from).format('hh:mm a'),
        endDate : moment(parkings[0].to).format('ll'),
        endTime : moment(parkings[0].to).format('hh:mm a'),
        zone : parkings[0].zone.zone_name,
        city : parkings[0].city.city_name,
        rate : parkings[0].rate.rate_name,
        amount : parkings[0].amount,
        parking_id : parkings[0].parking_id,
        plate : parkings[0].plate,
        service_fee : parseFloat(parkings[0].service_fee)/100,
      }
      let emailRes = await email_helper.send_email('Parking Receipt','./views/receipt.ejs',parkings[0].user.email,emailBody);
      res.send({
        sent: emailRes,
        msg:"Receipt is sent to "+parkings[0].user.email,
        status: 'success'
      });
    }else{
      res.send({
        sent: 0,
        msg:"Parking not found",
        status: 'error'
      });
    }
  } catch (err) {
      res.status(500).json({ success: false, msg: err.message, status: 'error' });
  }
}

module.exports.getUserHistory = async function(req,res){
  try {
    let parkings = await Parkings.
    find({user: req.body.user_id}).
    sort({_id: -1}).
    populate('city').
    populate('user').
    populate('rate').
    populate('zone');
    res.send(parkings);
  } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
  }
}

module.exports.getCurrentParking = async function(req,res){
  try {
    let parkings = await Parkings.
    find({
      $and: [
        {
          from: {
            $lte: new Date()
          }
        },
        {
          to: {
            $gte: new Date()
          }
        },
        {
          user: req.body.user_id
        }
      ]
    }).
    sort({_id: -1}).
    populate('city').
    populate('user').
    populate('zone').
    populate('rate');
    res.send(parkings);
  } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
  }
}

module.exports.getCurrentParkingsByPlate = async function(req,res){
  try {
    let parkings = await Parkings.
    find({
      $and: [
        {
          from: {
            $lte: new Date()
          }
        },
        {
          to: {
            $gte: new Date()
          }
        },
        {
          plate: { $in: req.body.plates }
        }
      ]
    }).
    sort({_id: -1}).
    populate('city').
    populate('user').
    populate('zone').
    populate('rate');
    res.send(parkings);
  } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
  }
}

module.exports.editParking = async function (req, res){
  Parkings.findByIdAndUpdate(req.body.id, req.body, {new: true})
    .then(response => {
        if(!response) {
            return res.status(404).json({
                msg: "Data not found with id " + req.body.id
            });
        }
        res.json(response);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).json({
                msg: "Data not found with id " + req.body.id
            });                
        }
        return res.status(500).json({
            msg: "Error updating Data with id " + req.body._id
        });
    });
}

module.exports.delAllParkings = async function (req, res){
  const parkings = await Parkings.deleteMany({});
  res.send(parkings);
}

module.exports.mobileParking = async function(req,res){
  if(req.body.amount == 0){
    req.body.from = moment(req.body.from, 'MMMM Do YYYY, hh:mm a' ).format()
    req.body.to = moment(req.body.to, 'MMMM Do YYYY, hh:mm a' ).format()
    req.body.parking_id = Math.floor(100000 + Math.random() * 900000)
    const parkings = new Parkings(req.body);
    parkings.save();
    res.send(parkings);
  }else {
    try {
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: req.body.cardNum,
          exp_month: req.body.expMonth,
          exp_year: req.body.expYear,
          cvc: req.body.cvv,
        },
      });
      try {
        const payment = await stripe.paymentIntents.create({
          amount: parseFloat(req.body.amount) * 100,
          currency: "CAD",
          description: req.body.plate + " is parked from " + req.body.from + " to " + req.body.to,
          payment_method: paymentMethod.id,
          confirm: true,
        });
        req.body.paymentMethod = payment.payment_method;
        req.body.from = moment(req.body.from, 'MMMM Do YYYY, hh:mm a' ).format()
        req.body.to = moment(req.body.to, 'MMMM Do YYYY, hh:mm a' ).format()
        req.body.parking_id = Math.floor(100000 + Math.random() * 900000)
        console.log(req.body)
        const parkings = new Parkings(req.body);
        parkings.save();
        res.send(parkings);
      } catch (error) {
        res.json({
          message: error,
          success: false,
        });
      }
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports.getParkingStatus = async function (req, res){
  let startDate = moment().toDate();
  startDate.setHours(0);
  startDate.setMinutes(0);
  let endDate = moment().toDate();
  endDate.setHours(23);
  endDate.setMinutes(59);
  // let body = {plate: req.body.plate, city: req.body.city_id};
  let body = {plate: req.body.plate};
  let parking = await Parkings.findOne({...{from: {$lte: new Date()},to: {$gte: new Date()}}, ...body}).select('-__v');
  const ticket_issued = await Ticket_Issued.find({plate: req.body.plate, ticket_status: "unpaid"}).
  populate('city').
  populate('zone').
  populate('parking').
  populate('ticket').
  populate('issued_by').
  select('-__v');
  let response = {};
  if(parking == null){
    parking = await Parkings.findOne({...{to: {$gte: startDate, $lt: endDate}}, ...body}).select('-__v');
    if(parking == null){
      response.status = 'unpaid';
      response.plate = req.body.plate;
    }else{
      response = parking.toObject();
      response.status = 'expired';
      response.from = moment(response.from).format('MMMM Do YYYY, hh:mm a');
      response.to = moment(response.to).format('MMMM Do YYYY, hh:mm a');
    }
  }else{
    response = parking.toObject();
    response.status = 'paid';
    response.from = moment(response.from).format('MMMM Do YYYY, hh:mm a');
    response.to = moment(response.to).format('MMMM Do YYYY, hh:mm a');
  }
  if(ticket_issued.length > 0){
    response.ticket_issued = ticket_issued
  }
  if(ticket_issued.length == 3){
    response.scofflaw = true
  }
  res.send(response);
}