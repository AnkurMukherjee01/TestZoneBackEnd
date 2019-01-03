'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

exports.loginCheck = function (req, res) {
  console.log(req.body);
  User.findOne({ email: req.body.email.toLowerCase(), approval: { $nin: ['N', 'D'] } })
    .exec()
    .then(function (user) {
      if (user != null) {
        bcrypt.compare(req.body.password, user.password, function (err, result) {
          if (err) {
            return res.status(401).json({
              failed: 'Unauthorized Access'
            });
          }
          if (result) {
            const JWTToken = jwt.sign({
              email: user.email,
              _id: user._id
            },
              'secret',
              {
                expiresIn: '4h'
              });
            User.findOneAndUpdate({ 'email': req.body.email.toLowerCase() }, { $set: { 'lastLogin': new Date() } }).exec();
            return res.status(200).json({
              success: 'Welcome to the Test Zone',
              token: JWTToken,
              email: user.email,
              isAdmin: user.isadmin,
              approval: user.approval,
              passChange: user.passChange,
              
            });

          }
          return res.status(401).json({
            failed: 'Unauthorized Access'
          });
        });
      }
      else {
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

exports.signUp = function (req, res) {
  console.log(req.body);
  User.findOne({ email: req.body.email.trim().toLowerCase() })
    .exec()
    .then(function (user) {
      console.log(user);
      if (user != "" && user != null ) {
        return res.status(409).json({
          error: 'User already exist'
        });
      }
      else {
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: auth
        });

        var mailOptions = {
          from: senderEmail,
          to: '' + senderEmail + ',' + req.body.email.trim().toLowerCase() + '',
          subject: 'New user approval Required',
          html: '<h3>Dear Candidate</h3><br/><div>Thanks for joining. We will approve soon.</div>'
        };
        var mailOptions = {
          from: senderEmail,
          to: senderEmail,
          // from: 'mukherjeenkur@gmail.com',
          // to: 'mukherjeenkur@gmail.com,'+req.body.email+'',
          subject: 'New user approval Required',
          html: '<h1>Dear Admin</h1><br/><div>New user <b>' + req.body.firstName + " " + req.body.lastName
            + '</b>has just signed up. For MCQ approve.<a href="https://completeanalytics.in/api/approvemail/?email=' + req.body.email
            + '&approval=M">APPROVE MCQ</a><br/>For Analytical Approve <a href="https://completeanalytics.in/api/approvemail/?email=' + req.body.email +
            '&approval=A">APPROVE Analytical</a><br/>For Both <a href="https://completeanalytics.in/api/approvemail/?email=' + req.body.email +
            '&approval=MA">BOTH</a></div><br/>For Decline <a href="https://completeanalytics.in/api/approvemail/?email=' + req.body.email +
            '&approval=D">Decline</a>'
        };

        bcrypt.hash(req.body.confirmPassword, 10, function (err, hash) {
          if (err) {
            return res.status(500).json({
              error: err
            });
          }
          else {

            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email.trim().toLowerCase(),
              password: hash,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              isadmin: false,
              approval: 'N'
            });
            user.save().then(function (result) {
              console.log("result" + result);
              transporter.sendMail(mailOptions, function (error, info) {
                transporter.sendMail(mailOptions, function (error, info) {
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

exports.changePassword = function (req, res) {
  console.log(req.body);
  User.findOne({ email: req.body.email.trim().toLowerCase(), approval: { $nin: ['N', 'D'] } })
    .exec()
    .then(function (user) {
      if (user != null) {

        bcrypt.compare(req.body.oldPassword, user.password, function (err, result) {
          if (err) {
            return res.status(401).json({
              failed: 'Incorrect old Password'
            });
          }
          else {
            bcrypt.hash(req.body.newPassword, 10, function (err, hash) {
              console.log(hash);
              if (err) {
                return res.status(500).json({
                  failed: err
                });
              }
              else {
                console.log(hash);
                User.findOneAndUpdate({ 'email': req.body.email.toLowerCase() },
                  {
                    password: hash,
                    passChange: false
                  },
                  { upsert: false }, function (err, doc) {
                    if (err) return res.send(500, 'Updation failure happened for ' + approval.email);
                    else {
                      return res.send({ 'success': "succesfully saved" });
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
      else {
        return res.status(409).json({
          failed: 'email Id not found'
        });
      }
    });
}

exports.forgetPassword = function (req, res) {
  console.log(req.body);
  User.findOne({ email: req.body.email.toLowerCase(), approval: { $nin: ['N', 'D'] } })
    .exec()
    .then(function (user) {
      if (user != null) {
        var pass = Math.floor(Math.random() * 10000);
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          // auth: {
          //   user: 'completeanalytics@gmail.com',
          //   pass: 'CARS@201106'
          // }
          auth: auth
        });
        var mailOptions = {
          from: senderEmail,
          to: req.body.email.toLowerCase(),
          subject: 'Login created -Complete Analytics',
          html: '<h3>Dear Candidate<h3><br/><p>New temporary Password is:' + pass.toString() + '.<br/> Please change password by clicking on Change Password Tab.</p>'
        };
        bcrypt.hash(pass.toString(), 10, function (err, hash) {
          console.log(hash);
          if (err) {
            return res.status(500).json({
              failed: err
            });
          }
          else {
            console.log(hash);
            User.findOneAndUpdate({ 'email': req.body.email.toLowerCase() },
              {
                password: hash,
                passChange: true
              },
              { upsert: false }, function (err, doc) {
                if (err) return res.send(500, 'Updation failure happened for ' + approval.email);
                else {
                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                  return res.send({ 'success': "Please check your registered email for temporary password" });
                }
              });
            // if(errorMessage.length>0){
            //     return res.send(500,errorMessage);
            // }

          }
        });
      }
      else {
        return res.status(409).json({
          failed: 'email Id not found'
        });
      }
    });
}

exports.updateUserDetails = function (req, res) {
  var token = req.get('Authorization').replace(/^Bearer\s/, '');

  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, 'secret', function (err,decoded) {
      User.findOneAndUpdate({ 'email': decoded.email },{$set:{'phNo':req.body.phno,'education':req.body.education,'exp':req.body.exp,'qualification':req.body.qualification}}
     ,function (err,usr) {
            console.log(err)
            if(err) {res.status(500).send({"error":"Error happened please Try again"})}
            else
              res.status(200).send({ "success": "updated successfully" });
          })
  });
}