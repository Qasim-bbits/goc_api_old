const { Users } = require('../models/users_model');
var email_helper = require('../helpers/email_helper');
var encrypt_helper = require('../helpers/encrypt_helper');
const constant = require('../lib/constant');
const { Agent_Permissions } = require('../models/agent_permission_model');

module.exports.getUsers = async function (req, res){
    const users = await Users.find().sort({_id: -1}).select('-__v');
    res.send(users);
}

module.exports.getUserProfile = async function (req, res){
    const users = await Users.find({_id : req.body.user_id}).select('-__v');
    users[0].password = encrypt_helper.crypto_decrypt(users[0].password)
    res.send(users);
}

module.exports.delItem = async function (req, res){
    const users = await Users.deleteOne({_id : req.body.id}).select('-__v');
    res.send(users);
}

module.exports.addUser = function(req,res){
    emailExist(req.body.email).then((response)=>{
        if(response.length > 0 && response[0].email_verified){
            res.send({
                exist: true,
                msg:"Email already exists",
                status: 'error'
            })
        }else{
            if(response.length > 0 && !response[0].email_verified){
                Users.deleteOne({email: response[0].email}, function(err, results) {
                    if (err){
                      console.log(err);
                      throw err;
                    }
                    console.log(results);
                 });
            }
            let password = Math.random().toString(36).slice(2)
            let cipherPassword = encrypt_helper.crypto_encrypt(password);
            var token = encrypt_helper.jwt_encode({ email: req.body.email, password: password }, '1h');
            req.body.password = cipherPassword;
            req.body.token = token;
            req.body.email_verified = 0
            req.body.forget_password = 1;
            let emailBody = { ... req.body };
            emailBody.path = constant.client_url;
            emailBody.password = password;
            const signup = new Users(req.body);
            signup.save();
            if(req.body.role == 'agent'){
                let obj = {
                    user: signup._id,
                    cities: req.body.cities
                };
                const agent_permission = new Agent_Permissions(obj);
                agent_permission.save();
            }
            email_helper.send_email('Confirmation Email','./views/confirm_reset_email.ejs',req.body.email,emailBody);
            res.send({
                exist: false,
                msg:"Email has been sent to "+req.body.email+". Please verify account to proceed",
                status: 'success'
            })
        }
    });
}

module.exports.editUser = async function (req, res){
    Users.findByIdAndUpdate(req.body.id, req.body, {new: true})
    .then(response => {
        if(!response) {
            return res.status(404).json({
                msg: "Data not found with id " + req.body.id
            });
        }
        if(req.body.role == 'agent'){
            Agent_Permissions.findOneAndUpdate(
                { user : req.body.id },
                { $set: { cities : req.body.cities } },
                { returnOriginal: false }
             )
            .then(result => {
                res.send({
                    exist: false,
                    msg:"Permission Updated Successfully",
                    status: 'success'
                })
            })
        }else{
            res.send({
                exist: false,
                msg:"User Updated Successfully",
                status: 'success'
            })
        }
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
    // const plates = await Plates.deleteOne({_id : req.body.id}).select('-__v');
    // res.send(plates);
}

const emailExist = async (email) =>{
    const user = await Users.find({email : email}).select('-__v');
    return await user;
}

module.exports.editProfile = async function (req, res){
    req.body.password = encrypt_helper.crypto_encrypt(req.body.password);
    Users.findByIdAndUpdate(req.body._id, req.body, {new: true})
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
    // const plates = await Plates.deleteOne({_id : req.body.id}).select('-__v');
    // res.send(plates);
}