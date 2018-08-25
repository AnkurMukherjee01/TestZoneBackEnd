'use strict';
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const Test = require('../models/test.model');
//const TestDetails = require('../models/test.model');
// const TestDet = require('../models/testDetails.model');

exports.mcqDet = function(req, res) {
    
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    console.log(token);
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, 'secret', function(err, decoded) {
        
      if (err) {console.log(err);return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })}
      else{
    User.findOne({email: decoded.email})
    .exec()
    .then(function(user) {
    return res.status(200).json({
        testDet: user.tests,
    });
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

exports.mcqFetchQuestion = function(req, res) {
    
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    console.log(token);
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, 'secret', function(err, decoded) {
        
      if (err) {console.log(err);return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })};
      
      console.log(req.body.testName);
    Test.find({testName: req.body.testName.trim()})
    .exec()
    .then(function(tst) {
        console.log(tst);
    return res.status(200).json({
        tst
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

exports.mcqSaveAnswer = function(req, res) {
    
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    console.log(token);
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, 'secret', function(err, decoded) {
        
      if (err) {console.log(err);return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })};
      
      console.log(req.body.testName);
      User.find({"email": decoded.email, "tests.testName":req.body.testName,"tests.assigneddate":req.body.assignedDate})
      .exec()
      .then(function(tst)
      {
          console.log("testDetail"+tst);

          if(testObjreturnvalue(tst,req.body.assignedDate,req.body.testName,req.body.answers.question)==1)
          {
              console.log("tst"+tst);
    // User.update({"email": decoded.email,"tests.assigneddate":req.body.assignedDate, "tests.testName":req.body.testName},{$set:{"tests.$.duration":req.body.duration},
    // $push:{"tests.$.answers":{"question":req.body.answers.question,"answer":req.body.answers.answer}}})
    User.findOneAndUpdate({"email": decoded.email,"tests": { $elemMatch:{"assigneddate":req.body.assignedDate, "testName":req.body.testName}}},{$set:{"tests.$.duration":
    req.body.duration}, $push:{"tests.$.answers":{"question":req.body.answers.question,"answer":req.body.answers.answer}}})
    .exec(function(err, doc){
        return res.status(200).json({
            success: 'Test has been Updated.'
         });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            error: error
        });
      });
    }
    else if(testObjreturnvalue(tst,req.body.assignedDate,req.body.testName,req.body.answers.question)==2){

        User.find({"email": decoded.email,"tests": { $elemMatch:{"assigneddate":req.body.assignedDate, "testName":req.body.testName,"answers":{$elemMatch:{"question":req.body.answers.question}}
       }}}).exec(function(err, doc){
            console.log("DOC"+doc);
            doc[0].tests.forEach(function(o){
                console.log("in tests");
                if(o.testName==req.body.testName){
                    var index=0;

                    o.answers.forEach(function(o1){
                        console.log("inanswer"+index);
                        if(o1.question==req.body.answers.question){
                            User.findOneAndUpdate({"email": decoded.email,"tests": { $elemMatch:{"assigneddate":req.body.assignedDate, "testName":req.body.testName,"answers":{$elemMatch:{"question":req.body.answers.question}}
                        }}},{$set:{"tests.$.duration":req.body.duration,
                        ["tests.$.answers."+index+".answer"]: req.body.answers.answer}}).exec(function(err,doc){
                            console.log(doc);
                        })
                        }
                        index++;
                    })
                }
            })
        return res.status(200).json({
            success: 'Test has been Updated.'
         });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            error: error
        });
      });
    }
    else{
        return res.status(200).json({
            success: 'Test not found.'
         });
    }
    });
 });
}

exports.mcqSaveTest = function(req, res) {
    
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    console.log(token);
    var totalMarks=0;
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, 'secret', function(err, decoded) {
        
      if (err) {console.log(err);return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })};
      
      console.log(decoded.email);
      console.log(req.body.testName)
    var marks=0;
    var ansComment=[];
    Test.find({testName: req.body.testName.trim()})
        .exec()
        .then(function(tste) {
          //  var x=tst.toObject();
        var testQuestionCounter=0;
       
            console.log(tste); 
            console.log(tste[0].testName);  
         totalMarks=tste[0].tests.length;
        var promise1 = new Promise((resolve, reject) => { 
            tste[0].tests.forEach(function(ts){
                
                console.log(ts);
                User.find({"email": decoded.email, "tests":{$elemMatch:{"testName":req.body.testName,"assigneddate":req.body.assignedDate, 
                "answers":{$elemMatch:{"question":ts.question,"answer":ts.answer}}}}})
                .exec().then(function(tsMatch){
                    console.log(tsMatch);
                    if(tsMatch!=undefined && tsMatch.length>0){
                        marks++;
                        testQuestionCounter++;
                        if(testQuestionCounter==tste[0].tests.length){
                            console.log("marks-resolve"+marks); 
                            resolve(marks);}
                    }
                    else{
                        testQuestionCounter++;
                        ansComment.push(ts.comments);
                        if(testQuestionCounter==tste[0].tests.length){
                            console.log("marks-resolve"+marks); 
                            resolve(marks);}
                    }
                   
                    
                    })
            });
            
        });

        promise1.then(()=>
{
    console.log("marks"+marks); 
    User.findOneAndUpdate({"email": decoded.email, "tests":{$elemMatch:{"testName":req.body.testName,"assigneddate":req.body.assignedDate}}},{$set:{"tests.$.duration":0,"tests.$.marks":marks,"tests.$.date":new Date()}}).exec(function(err, doc){
console.log(doc);
       console.log("marks"+marks);     
        return res.status(200).json({
            success: 'Test has been Updated.',
            marks:marks,
            totalMarks:totalMarks,
            comments: ansComment.filter( function( item, index, inputArray ) {
                return inputArray.indexOf(item) == index;
         })
         });
    })
    
 });
}
        );
    });
    
}

exports.mcqGetRank = function(req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    console.log(token);
    var totalMarks=0;
    var returnObj=[];
    var counter=0;
    
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, 'secret', function(err, decoded) {
        
      if (err) {console.log(err);return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })}
      else{
          
        User.find({"tests.testName":req.body.testName}).exec().then(function(usr){
             usr.filter(o=>{return o.email==decoded.email}).map(
                function(usrBatch){
                    // console.log(usrBatch);
                    usr.forEach(function(p){
                        counter++;
                        
                        if(p.batchName==usrBatch.batchName){
                            // console.log(p);
                            p.tests.forEach(function(ts){
                                var counter1 =0 ;
                                if(ts.testName==req.body.testName && ts.marks>0){
                                    // console.log("in pop"+returnObj);
                                    // console.log(ts);
                                    // console.log(returnObj.filter(o=>o.name==p.firstName+" "+p.lastName));
                                    if(returnObj.filter(o=>o.name==p.firstName+" "+p.lastName).length>0)
                                    {
                                        console.log("In update test"+ts);
                                        returnObj.filter(o=>o.name==p.firstName+" "+p.lastName).map(p1=>p1.marks=ts.marks);
                                        counter1++;
                                        if(counter==usr.length && counter1==p.length){
                                            console.log("returnObj"+returObj);
                                            return res.status(200).json({
                                                userDet: returnObj,
                                               // percentile:percentileCalc(usr,req.body.testName,decoded.email)
                                            });
                                        } 
                                    }
                                    else{
                                        console.log("ts"+ts);
                                returnObj.push({"name": p.firstName+" "+p.lastName, "marks":ts.marks});
                                console.log(returnObj);
                                counter1++;
                                console.log(counter);
                                console.log(counter1);
                                if(counter==usr.length && counter1==p.length){
                                    console.log("returnObj"+returnObj);
                                    return res.status(200).json({
                                        userDet: returnObj,
                                      //  percentile:percentileCalc(usr,req.body.testName,decoded.email)
                                    });
                                }
                                    }
                                
                                
                                
                                }
                            })
                            
                        }
                        else{
                            if(counter==usr.length){
                                return res.status(200).json({
                                    userDet: returnObj,
                                   // percentile:percentileCalc(usr,req.body.testName,decoded.email)
                                });
                            }
                        }
                    })
                    
                   
                 });
                });
        

      }
      
    });
}


var findTestObj = function(tst,assignedDate,testName){
    
    return tst[0].tests.filter(function(o){ return o.testName==testName &&  new Date(o.assigneddate).getTime()==new Date(assignedDate).getTime()});
}
var testObjreturnvalue = function(tst,assignedDate,testName,question){
    if(findTestObj(tst,assignedDate,testName)!=undefined || findTestObj(tst,assignedDate,testName)!=null || findTestObj(tst,assignedDate,testName)!={}){
        if (findTestObj(tst,assignedDate,testName)[0].answers.filter(function(o){console.log("question"+o.question +" "+question); return o.question==question}).length>0){
            return 2;
        }
            else
        return 1;
    }
    else{
        return 0; 
    }
}
var percentileCalc= function(usr, testName, email){
    return (usr.filter(o=>{return o.email==email})[0].tests.filter(o=>{return o.testName==testNamel})[0].marks - getMinY(usr, testName))*100/(getMaxY(usr,testName)-getMinY(usr,testName))
}

function getMinY(usr, testName) {
    return usr.reduce((min, p) => p.tests.filter(o1=>o1.testName==testName)[0].marks < min ? 
    p.tests.filter(o1=>o1.testName==testName)[0].marks : min, usr[0].tests.filter(o1=>o1.testName==req.body.testName)[0].marks);
  }
  function getMaxY(usr, testName) {
    return usr.reduce((max, p) => p.tests.filter(o1=>o1.testName==testName)[0].marks > max ? 
    p.tests.filter(o1=>o1.testName==testName)[0].marks : max, usr[0].tests.filter(o1=>o1.testName==req.body.testName)[0].marks);
  }