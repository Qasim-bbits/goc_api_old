const { Ticket_Aging } = require('../models/tickets_aging_model');
const { Tickets } = require('../models/tickets_model');

module.exports.getTickets = async function (req, res){
    const tickets = await Tickets.find().sort({ "ticket_name": 1 }).select('-__v');
    res.send(tickets);
}

module.exports.getAgingByTicket = async function (req, res){
    const tickets = await Ticket_Aging.find({ticket: req.body.ticket}).sort({ "order": 1 }).select('-__v');
    res.send(tickets);
}

module.exports.addTicket = function(req,res){
    req.body.ticket_num_next = (+req.body.ticket_num_min+ +1);
    const tickets = new Tickets(req.body);
    tickets.save();
    req.body.ticket_aging.forEach(function (element) {
        element.ticket = tickets._id;
      });
    Ticket_Aging.insertMany(req.body.ticket_aging);
    res.send(tickets);
}

module.exports.editTicket = function(req,res){
    let arr = [];
    Tickets.findByIdAndUpdate(req.body.id, req.body, {new: true})
    .then(result =>{
        if(!result) {
            return res.status(404).json({
                msg: "Data not found with id " + req.body.id
            });
        }
        req.body.ticket_aging.map(x=>{
            if(x.id !== undefined){
                Ticket_Aging.findByIdAndUpdate(x.id, x, {new: true})
                .then(response =>{
                    arr.push(response);
                })
            }else{
                x.ticket = req.body.id;
                const tickets = new Ticket_Aging(x);
                tickets.save();
            }
        })
    })
    res.send(arr)
}

module.exports.editAllTicket = function(req,res){
    Tickets.updateMany({}, {"$set":req.body})
    .then(result =>{
        res.send(result);
    })
}

module.exports.delTicket = async function(req,res){
    await Ticket_Aging.deleteMany({ticket : req.body.id}).select('-__v');
    const ticket = await Tickets.deleteOne({_id : req.body.id}).select('-__v');
    res.send(ticket);
}

