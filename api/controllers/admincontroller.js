// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Test = require('../models/test.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const approval = require('../models/responseModel/approval')
var XLSX = require('xlsx')
var nodemailer = require('nodemailer');



exports.fetchApproval = function(req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    console.log(token);
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, 'secret', function(err, decoded) {
        
      if (err) {console.log(err);return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' })};
      
    User.find({approval: 'N'})
    .exec()
    .then(function(user) {
var pendingApproval=[];
        user.forEach(function(usr) {
            pendingApproval.push({
                name:usr.firstName+" "+usr.lastName,
                email:usr.email,
                approval:usr.approval,
                batchName:""
            }) 
          });
    return res.status(200).json({
        pendingApproval
    });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            error: error
        });
      });
 });
}

//Update approval api
exports.UpdateApproval = function(req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, 'secret', function(err) {
        
      if (err) {console.log(err);return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' })}
      else{
var errorMessage=[];
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'completeanalytics@gmail.com',
      pass: 'CARS@201106'
    }
  });
  
  
req.body.approvals.forEach(function(approval){
    var mailOptions = {
        from: 'completeanalytics@gmail.com',
        to: 'completeanalytics@gmail.com,'+approval.email+'',
        subject: 'New user approval Required',
        text: '<h3>Hi candidate<h3><br/><p>Complete analytics has approved your login.'
      };
    User.findOneAndUpdate({'email':approval.email}, {approval:approval.approval,batchName:approval.batchName}, {upsert:false}, function(err, doc){
        if (err) errorMessage.push('Updation failure happened for '+ approval.email)
        else{
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
        }
    });
    if(errorMessage.length>0){
        return res.send(500,errorMessage);
    }
    return res.send("succesfully saved");
})
.catch(error => {
    console.log(error);
    res.status(500).json({
        error: error
    });
  });
}     
 });
}

exports.CreateBulkUser = function(req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, 'secret', function(err) {
        
      if (err) {console.log(err);return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' })}
      else{
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'completeanalytics@gmail.com',
              pass: 'CARS@201106'
            }
          });
          
          
var errorMessage=[];
var insertobj = [];

//let data = new Buffer(req.body.excel, 'base64');  
var workbook = XLSX.read(req.body.excel, {type:'base64'});
var first_sheet_name = workbook.SheetNames[0];
/* Get worksheet */
var worksheet = workbook.Sheets[first_sheet_name];
var excel_as_json=XLSX.utils.sheet_to_json(worksheet);
var i=0;
for(var R = 0; R <excel_as_json.length; R++) {
    // for(var C = range.s.c; C <= range.e.c; ++C) 
      /* Find desired cell *

    /* Get the value */
    
    var pass=Math.floor(Math.random() * 10000);
    
        bcrypt.hash(pass.toString(), 10,function(err, hash){
            var email = excel_as_json[i]["EmailId"];
    /* Get the value */
    var firstName = excel_as_json[i]["FirstName"];
    
    /* Get the value */
    var lastName = excel_as_json[i]["LastName"];
    
    /* Get the value */
    var app = excel_as_json[i]["Approval"];
    var batchName = excel_as_json[i]["BatchName"];
            if(email!=undefined  && email!=""){
                i++ ;
    
            console.log(hash);
            User.find({'email':email}).exec().then(function(usr){  
                if(usr!=undefined && usr!=null && usr.length>0) {
                    User.findOneAndUpdate({'email':email}, 
                    {
                        $set:{
                            firstName: firstName,
                            lastName: lastName,
                            isadmin:false,
                            approval:app,
                            batchName:batchName.toLowerCase()   
                        }
                    }, 
                    {upsert:false}, 
                    function(err, doc){
                        if (err) errorMessage.push('Updation failure happened for '+ approval.email);
                    });
                  
                }   
                else{ 
                    var mailOptions = {
            from: 'completeanalytics@gmail.com',
            to: email,
            subject: 'Login created -Complete Analytics',
            text: '<h3>Dear Candidate<h3><br/><p>CompleteAnalytics has created your login. Please change your password and login to test portal of Complete Analytics. Password:'+pass.toString()+'</p>'
          };
            insertobj.push({
                _id: new  mongoose.Types.ObjectId(),
                email: email,
                password: hash  ,
                 firstName: firstName,
                 lastName: lastName,
                 isadmin:false,
                 approval:app,
                 passChange:true,
                 batchName:batchName.toLowerCase()
             });
             console.log(i);
             transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
             if(i==excel_as_json.length){
                console.log("insr"+insertobj);
                User.insertMany(insertobj, function(err, docs) {
                    if (err) errorMessage.push('Insertion failure happened for ');
                    res.status(200).json({
                        success: 'New user has been created'
                     });
                });
                
            }
        }
        });
        }

else{
    res.status(200).json({
        success: 'No User Found'
     });
}
        
    });
  }
}     
 });
}

exports.CreateTest = function(req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, 'secret', function(err) {
        
      if (err) {console.log(err);return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' })}
      else{
        Test.find({testName: req.body.testName.toUpperCase()})
        .exec()
        .then(function(tst) {
            console.log(tst);
            if(tst!=null && tst.length>0){
                Test.findOneAndUpdate({testName: req.body.testName.toUpperCase()}, { testDuration: req.body.testDuration}, {upsert:false}, function(err, doc){
                    if (err) errorMessage.push('Updation failure happened for '+ req.body.testName);
                    var workbook = XLSX.read(req.body.testFile, {type:'base64'});
                    var first_sheet_name = workbook.SheetNames[0];
                    /* Get worksheet */
                    var worksheet = workbook.Sheets[first_sheet_name];
                    var excel_as_json=XLSX.utils.sheet_to_json(worksheet);
                    var testArray=[]
                    var i=1;
                    console.log(excel_as_json);
                    for(var R = 0; R <excel_as_json.length; R++) {
                        testArray.push({
                            question: excel_as_json[R]["Question"].trim(),
                            image: excel_as_json[R]["Image"], 
                            answer:  excel_as_json[R]["answer"].trim(),  
                            comments: excel_as_json[R]["comments"].trim(),
                           options: []  ,
                         });
                         var j=0;
                         for (var key in excel_as_json[i-1]) {
                            j++;
                             if(key.startsWith('option'))
                             {
                                testArray[i-1].options.push(excel_as_json[i-1][key].trim());
                                var index=Object.keys(excel_as_json[i-1]).indexOf(key);
                                if(i==excel_as_json.length && Object.keys(excel_as_json[i-1]).length==j) 
                                {
                                    Test.findOneAndUpdate({testName: req.body.testName.trim()}, { tests: testArray}).exec( function(err, doc) {
                                        console.log("DOC.................."+doc+"inedex"+index+"i....."+i);
                                        if(err){console.log(err);res.send(500,{message:'Updation failure happened for '})}
                                        res.status(200).json({
                                           success: 'Test has been Updated.'
                                        });
                                     });
                                     
                                }
                             }
                             else{
                                if(i==excel_as_json.length && Object.keys(excel_as_json[i-1]).length==j) 
                                {
                                    Test.findOneAndUpdate({testName: req.body.testName.trim()}, { tests: testArray}).exec( function(err, doc) {
                                        console.log("DOC.................."+doc+"inedex"+index+"i....."+i);
                                        if(err){console.log(err);res.send(500,{message:'Updation failure happened for '})}
                                        res.status(200).json({
                                           success: 'Test has been Updated.'
                                        });
                                     });
                                     
                                }
                             }
                            
                        }
                        i++;
                    }
                });
            }
            else{
                
        const test = new Test({
            _id: new  mongoose.Types.ObjectId(),
            testName: req.body.testName.toUpperCase() ,
            testDuration: req.body.testDuration,
             testType: req.body.testType,
             tests:[]
         });

        var workbook = XLSX.read(req.body.testFile, {type:'base64'});
        var first_sheet_name = workbook.SheetNames[0];
        /* Get worksheet */
        var worksheet = workbook.Sheets[first_sheet_name];
        var excel_as_json=XLSX.utils.sheet_to_json(worksheet);
        var testArray=[]
        var i=0;
        console.log(excel_as_json);
        for(var R = 0; R <excel_as_json.length; R++) {
            test.tests.push({
                question: excel_as_json[R]["Question"],
                image: excel_as_json[R]["Image"], 
                answer:  excel_as_json[R]["answer"], 
                comments:excel_as_json[R]["comments"],               
               options: []  ,
             });
             for (var key in excel_as_json[i]) {
                
                 if(key.startsWith('option'))
                 {
                    test.tests[i].options.push(excel_as_json[i][key]);
                    var index=Object.keys(excel_as_json[i]).indexOf(key);
                    if(R==excel_as_json.length-1 && excel_as_json[i][index+1]==undefined) 
                    {
                        test.save().then(function(result) {
                            res.status(200).json({
                               success: 'New test has been created.'
                            });
                         })
                    }
                 }
                
            }
            i++;
        }
      }
    })
    }
    })
}

//Update approval api
exports.AssignTest = function(req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, 'secret', function(err,decoded) {
        
      if (err) {console.log(err);return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' })}
      else{
var errorMessage=[];
console.log(req.body);
//assignTestCall(req.body.email,req.body.test,res);
User.findOneAndUpdate({'email':req.body.email}, { $push:{tests:{testName:req.body.test,assigneddate:new Date(),answers:[]}}}).exec(function(err, doc){
    if (err){console.log(err); return res.send(500,{message:'Updation failure happened for '+ req.body.email});}
    else return res.send({"success":"succesfully saved"});
})
// .catch(error => {
// console.log(error);
// res.status(500).json({
//     error: error
// });
// });
}     
 });
}
var assignTestCall = function(email,testName,res){
    User.findOneAndUpdate({'email':email}, { $push:{tests:{testName:testName,assigneddate:new Date(),answers:[]}}}).exec(function(err, doc){
        if (err){console.log(err); return res.send(500,{message:'Updation failure happened for '+ req.body.email});}
       // else return res.send({"success":"succesfully saved"});
    })
.catch(error => {
    console.log(error);
    res.status(500).json({
        error: error
    });
  });
}

exports.AssignTestBulk= function(req,res){
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, 'secret', function(err) {
        
      if (err) {console.log(err);return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' })}
      else{
        var workbook = XLSX.read(req.body.excel, {type:'base64'});
        var first_sheet_name = workbook.SheetNames[0];
        /* Get worksheet */
        var worksheet = workbook.Sheets[first_sheet_name];
        var excel_as_json=XLSX.utils.sheet_to_json(worksheet);
        var i=0;
        var assignedDet=[];
        for(var R = 0; R <excel_as_json.length; R++) {
            var testList=excel_as_json[R]["TestList"].split(",");
            console.log(testList);
            for(var c=0;c<testList.length;c++){
               // assignTestCall(excel_as_json[R]["StudentEmail"],testList[c],res);
               
                console.log(testList[c]);
                User.findOneAndUpdate({'email':excel_as_json[R]["StudentEmail"]}, { $push:{tests:{testName:testList[c].toUpperCase(),assigneddate:new Date(),answers:[]}}}).exec(function(err, doc){
                    if (err){console.log(err); return res.send(500,{message:'Updation failure happened for '+ req.body.email});}
                 //   else return res.send({"success":"succesfully saved"});
                })
                if(R==excel_as_json.length-1 && c==testList.length-1){
                    return res.send({"success":"succesfully saved"});
                }
            // }
            // else{
            //     if(R==excel_as_json.length-1 && c==testList.length-1){
            //         return res.send({"success":"succesfully saved"});
            //     }
          //  }
            }
        }
      }
    });
}

exports.DeleteTest = function(req, res) {

    console.log(req.body.test);
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, 'secret', function(err) {
        
      if (err) {console.log(err);return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' })}
      else{
var errorMessage=[];
Test.find({'testName':req.body.test}).remove(function(err, doc){
    if (err) {console.log(err);return res.send(500,{message:'failed to remove '+ req.body.test});}
    else return res.send({"success":"succesfully deleted"});
})
.catch(error => {
console.log(error);
res.status(500).json({
    error: error
});
});
}     
 });
}

exports.getBatchName = function(req,res){
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, 'secret', function(err) {
        
      if (err) {console.log(err);return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' })}
      else{
          var batchName=[];
            User.find({},function(err,usr){
                console.log(usr);
                if (err) return res.send(500,{message:'failed to remove '+ req.body.test});
                else{
                    var i=0;
                usr.forEach(function(u){
                    i++;
                   console.log(u);
                   if(u.batchName!=undefined && u.batchName!=""){
                       batchName.push(u.batchName);
                    if(i==usr.length){
                        console.log(batchName);
                        res.status(200).json({
                            batch: batchName
                         });
                    }
                    else{
                        if(i==usr.length){
                            console.log(batchName);
                            res.status(200).json({
                                batch: batchName
                             });
                        }
                    }
                    }
                })
            }
            })
            // .exec().then(function(user){
            //     console.log(batchName);
            //     res.status(200).json({
            //         batch: batchName
            //      });
            // })
      }
    })
}

exports.getUserDetails = function(req,res){
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, 'secret', function(err) {
        
      if (err) {console.log(err);return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' })}
      else{
          var batchName=[];
            User.find({batchName:req.body.batchName}
            ).exec().then(function(user){
                res.status(200).json({
                    user:user
                 });
            })
      }
    })
}
