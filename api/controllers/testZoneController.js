'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

exports.loginCheck = function(req, res) {
  console.log(req.body);
  User.findOne({email: req.body.email,approval: {$nin: ['N','D']}})
  .exec()
  .then(function(user) {
    if(user!=null){
     bcrypt.compare(req.body.password, user.password, function(err, result){
        if(err) {
           return res.status(401).json({
              failed: 'Unauthorized Access'
           });
        }
        if(result) {
          const JWTToken = jwt.sign({
            email: user.email,
            _id: user._id
          },
          'secret',
           {
             expiresIn: '4h'
           });
           User.findOneAndUpdate({'email':req.body.email},{$set:{'lastLogin':new Date()}});
           return res.status(200).json({
             success: 'Welcome to the Test Zone',
             token: JWTToken,
             email:user.email,
             isAdmin:user.isadmin,
             approval:user.approval,
             passChange:user.passChange
           });
      
        }
        return res.status(401).json({
           failed: 'Unauthorized Access'
        });
     });
    }
    else{
      return res.status(401).json({
        failed: 'Unauthorized Access. Please sign up and wait for upto 1 day for approval'
     });
    }
  })
  .catch(error => {
    console.log(error);
     res.status(500).json({
        error: error
     });
  });
  };

  exports.signUp=function(req, res) {
    console.log(req.body);
    User.findOne({email: req.body.email})
    .exec()
    .then(function(user) {
      console.log(user);
      if(user!="" && user != null)
      {
        return res.status(409).json({
          error: 'User already exist'
       });
      }
      else{
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'completeanalytics@gmail.com',
            pass: 'CARS@201106'
            //  user: 'mukherjeenkur@gmail.com',
            // pass: 'jibontori'
          }
        });
        
        var mailOptions = {
          from: 'completeanalytics@gmail.com',
          to: 'completeanalytics@gmail.com,'+req.body.email+'',
          // from: 'mukherjeenkur@gmail.com',
          // to: 'mukherjeenkur@gmail.com,'+req.body.email+'',
          subject: 'New user approval Required',
          html: '<h1>Dear Admin</h1><br/><div>New user <b>'+req.body.firstName+ " "+req.body.lastName+'</b>has just signed up. Please approve.</div>'
        };
        
        
    bcrypt.hash(req.body.confirmPassword, 10, function(err, hash){
       if(err) {
          return res.status(500).json({
             error: err
          });
       }
       else {
       
          const user = new User({
             _id: new  mongoose.Types.ObjectId(),
             email: req.body.email,
             password: hash  ,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              isadmin:false,
              approval:'N'
          });
          user.save().then(function(result) {
             console.log("result"+result);
             transporter.sendMail(mailOptions, function(error, info){transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
             res.status(200).json({
                success: 'New user has been created.Once Approved will recieve email.'
             });
          }).catch(error => {
             res.status(500).json({
                error: err
             });
          });
       }
    });
  }
});
  }

  exports.changePassword=function(req, res) {
    console.log(req.body);
    User.findOne({email: req.body.email,approval: {$nin: ['N','D']}})
    .exec()
    .then(function(user) {
      if(user!=null){
        
    bcrypt.compare(req.body.oldPassword, user.password, function(err, result){
      if(err) {
         return res.status(401).json({
            failed: 'Incorrect old Password'
         });
      }
       else {
        bcrypt.hash(req.body.newPassword, 10, function(err, hash){
          console.log(hash);
          if(err) {
             return res.status(500).json({
                failed: err
             });
          }
          else {
            console.log(hash);
            User.findOneAndUpdate({'email':req.body.email}, 
            {
              password: hash  ,
              passChange:false
            }, 
            {upsert:false}, function(err, doc){
              if (err) return res.send(500,'Updation failure happened for '+ approval.email);
              else{
                return res.send({'success':"succesfully saved"});
             }
          });
          // if(errorMessage.length>0){
          //     return res.send(500,errorMessage);
          // }
          
      }
    });
  }
});
  }
  else{
    return res.status(409).json({
      failed:'email Id not found'
   });
  }
});
}
  