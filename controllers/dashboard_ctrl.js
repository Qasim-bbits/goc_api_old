const { Parkings } = require('../models/parking_model');

module.exports.getDashboard = async function(req,res){
    let data = {};
    const current = await Parkings.find({from: {$lte: new Date()},to: {$gte: new Date()}}).count().select('-__v');
    const all = await Parkings.find().count().select('-__v');
    const paid = await Parkings.find({service_fee: { $ne: '0' }}).count().select('-__v');
    const free = await Parkings.find({service_fee: '0'}).count().select('-__v');
    const assetsReport = await Parkings.aggregate([
        {
            $group:
            {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$from' } },
            Amount: { $sum: { $multiply: [ "$amount", { "$divide": [ 1, 100 ] } ] } },
            count: { $sum: 1 }
            }
        },
        {"$sort": {_id: 1}}
      ])
      
    data['current'] = current;
    data['all'] = all;
    data['paid'] = paid;
    data['free'] = free;
    data['assetsReport'] = assetsReport.map((obj, i) => ({ ...obj, Amount: (parseFloat((assetsReport[i].Amount).toFixed(2))) }));
    res.send(data);
}

const parkingsData = async (body) =>{
    const parkings = await Parkings.find(body).select('-__v');
    return await parkings;
}