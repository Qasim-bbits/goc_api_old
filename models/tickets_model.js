const mongoose = require('mongoose');

const Tickets = mongoose.model(
    'Tickets',
    new mongoose.Schema({
        ticket_name : {
            type : String,
            required : false,
            minlength : 0
        },
        ticket_num_min : {
            type : Number,
            required : false,
            minlength : 0
        },
        ticket_num_next : {
            type : Number,
            required : false,
            minlength : 0
        },
    })
)
exports.Tickets = Tickets;