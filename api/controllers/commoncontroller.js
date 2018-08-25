'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const Test = require('../models/test.model');

exports.fetchTestList = function(req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    console.log(token);
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, 'secret', function(err, decoded) {
        
      if (err) {console.log(err);return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' })};
      
    Test.find()
    .exec()
    .then(function(test) {
        return res.status(200).json({
            test  
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            error: error
        });
      });
 });
});
}

// exports.fetchUserNameMcq = function(req, res) {
//     var token = req.get('Authorization').replace(/^Bearer\s/, '');
//     console.log(token);
//     if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
//     jwt.verify(token, 'secret', function(err, decoded) {
        
//       if (err) {console.log(err);return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' })};
      
//     User.find({approval: {$in:['M','MA']}})
//     .exec()
//     .then(function(user) {
//     return res.status(200).json({
//         testName:usr.firstName+" "+usr.lastName,
//     });
//     })
//     .catch(error => {
//         console.log(error);
//         res.status(500).json({
//             error: error
//         });
//       });
//  });
// }

exports.fetchUserName = function(req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    console.log(token);
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, 'secret', function(err, decoded) {
        
      if (err) {console.log(err);return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' })};
      var name=[];
      var i=0;
    User.find({approval: {$in:[req.body.type,'MA']}})
    .exec()
    .then(function(user) {
        user.forEach(function(usr){
        name.push({name:usr.firstName+" "+usr.lastName,email:usr.email});
        i++;
        if(user.length == i){
            return res.status(200).json({
                name
            });
        }
    })
    // return res.status(200).json({
    //     name.push(usr.firstName+" "+usr.lastName),
    // });
 })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            error: error
        });
      });
 });
}