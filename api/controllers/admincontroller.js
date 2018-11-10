const mongoose = require('mongoose');
const User = require('../models/user.model');
const Test = require('../models/test.model');
const Batch = require('../models/batch.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const querystring = require('querystring');
const approval = require('../models/responseModel/approval')
var XLSX = require('xlsx')
var nodemailer = require('nodemailer');



exports.fetchApproval = function (req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    console.log(token);
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err, decoded) {

        if (err) { console.log(err); return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' }) };

        User.find({ approval: 'N' })
            .exec()
            .then(function (user) {
                var pendingApproval = [];
                user.forEach(function (usr) {
                    pendingApproval.push({
                        name: usr.firstName + " " + usr.lastName,
                        email: usr.email,
                        approval: usr.approval,
                        batchName: ""
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
exports.UpdateApproval = function (req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');

    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err) {

        if (err) { console.log(err); return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' }) }
        else {
            var errorMessage = [];
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                // auth: {
                //   user: 'completeanalytics@gmail.com',
                //   pass: 'CARS@201106'
                // }
                auth: auth
            });

            var counter = 0;
            
            req.body.approvals.forEach(function (approval) {
                counter++;
                var mailOptions = {
                    from: senderEmail,
                    to: '' + senderEmail + ',' + approval.email + '',
                    subject: 'New user approval Required',
                    html: '<h3>Hi candidate<h3><br/><p>Complete analytics has approved your login.</p>'
                };
                User.findOneAndUpdate({ 'email': approval.email }, { approval: approval.approval, batchName: approval.batchName==""?"misc batch":approval.batchName }, { upsert: false }, function (err, doc) {
                    if (err) errorMessage.push('Updation failure happened for ' + approval.email)
                    else {
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
                        if (counter.length = req.body.approvals.length) {
                            if (errorMessage.length > 0) {
                                return res.send(500, errorMessage);
                            }
                            return res.send({ success: "succesfully updated" });
                        }
                    }
                });


            })


        }
    });
}
exports.mailApproval = function (req, res) {
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
        to: '' + senderEmail + ',' + approval.email + '',
        subject: 'New user approval Required',
        html: '<h3>Hi candidate<h3><br/><p>Complete analytics has approved your login.</p>'
    };
    User.findOneAndUpdate({ 'email': req.query.email }, { approval: req.query.approval, batchName: 'misc batch' }, { upsert: false }, function (err, doc) {
        if (err) errorMessage.push('Updation failure happened for ' + approval.email)
        else {
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
                success: 'Success'
            });
        }
    });
}
exports.CreateBulkUser = function (req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');

    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err) {

        if (err) { console.log(err); return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' }) }
        else {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                // auth: {
                //   user: 'completeanalytics@gmail.com',
                //   pass: 'CARS@201106'
                // }
                auth: auth
            });


            var errorMessage = [];
            var insertobj = [];

            //let data = new Buffer(req.body.excel, 'base64');  
            var workbook = XLSX.read(req.body.excel, { type: 'base64' });
            var first_sheet_name = workbook.SheetNames[0];
            /* Get worksheet */
            var worksheet = workbook.Sheets[first_sheet_name];
            var excel_as_json = XLSX.utils.sheet_to_json(worksheet);
            var i = 0;
            for (var R = 0; R < excel_as_json.length; R++) {
                // for(var C = range.s.c; C <= range.e.c; ++C) 
                /* Find desired cell *
          
              /* Get the value */

                var pass = Math.floor(Math.random() * 10000);

                bcrypt.hash(pass.toString(), 10, function (err, hash) {
                    var email = excel_as_json[i]["EmailId"];
                    /* Get the value */
                    var firstName = excel_as_json[i]["FirstName"];

                    /* Get the value */
                    var lastName = excel_as_json[i]["LastName"];

                    /* Get the value */
                    var app = excel_as_json[i]["Approval"];
                    var batchName = excel_as_json[i]["BatchName"];
                    if (email != undefined && email != "") {
                        i++;

                        console.log(hash);
                        User.find({ 'email': email }).exec().then(function (usr) {
                            if (usr != undefined && usr != null && usr.length > 0) {
                                User.findOneAndUpdate({ 'email': email },
                                    {
                                        $set: {
                                            firstName: firstName,
                                            lastName: lastName,
                                            isadmin: false,
                                            approval: app,
                                            batchName: batchName.toLowerCase()
                                        }
                                    },
                                    { upsert: false },
                                    function (err, doc) {
                                        if (err) errorMessage.push('Updation failure happened for ' + approval.email);
                                    });

                            }
                            else {
                                var mailOptions = {
                                    from: senderEmail,
                                    to: email,
                                    subject: 'Login created -Complete Analytics',
                                    html: '<h3>Dear Candidate<h3><br/><p>CompleteAnalytics has created your login. Please change your password and login to test portal of Complete Analytics. Password:' + pass.toString() + '</p>'
                                };
                                insertobj.push({
                                    _id: new mongoose.Types.ObjectId(),
                                    email: email,
                                    password: hash,
                                    firstName: firstName,
                                    lastName: lastName,
                                    isadmin: false,
                                    approval: app,
                                    passChange: true,
                                    batchName: batchName.toLowerCase()
                                });
                                console.log(i);
                                transporter.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        console.log('Email sent: ' + info.response);
                                    }
                                });
                                if (i == excel_as_json.length) {
                                    console.log("insr" + insertobj);
                                    User.insertMany(insertobj, function (err, docs) {
                                        if (err) errorMessage.push('Insertion failure happened for ');
                                        res.status(200).json({
                                            success: 'New user has been created'
                                        });
                                    });

                                }
                            }
                        });
                    }

                    else {
                        res.status(200).json({
                            success: 'No User Found'
                        });
                    }

                });
            }
        }
    });
}

exports.CreateTest = function (req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');

    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err) {

        if (err) { console.log(err); return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' }) }
        else {
            Test.find({ testName: req.body.testName.toUpperCase() })
                .exec()
                .then(function (tst) {
                    console.log(tst);
                    if (tst != null && tst.length > 0) {

                        Test.findOneAndUpdate({ testName: req.body.testName.toUpperCase() }, { testDuration: req.body.testDuration, noOfQstn: req.body.noOfQstn }, { upsert: false }, function (err, doc) {
                            if (err) errorMessage.push('Updation failure happened for ' + req.body.testName);
                           
                            if(req.body.testFile!=undefined && req.body.testFile.length>0){
                                console.log("testfile"+req.body.testFile)
                                var workbook = XLSX.read(req.body.testFile, { type: 'base64' });
                                var first_sheet_name = workbook.SheetNames[0];
                                /* Get worksheet */
                                var worksheet = workbook.Sheets[first_sheet_name];
                                var excel_as_json = XLSX.utils.sheet_to_json(worksheet);
                                var testArray = []
                                var i = 1;
                                console.log(excel_as_json);
                                for (var R = 0; R < excel_as_json.length; R++) {
                                    testArray.push({
                                        question: excel_as_json[R]["Question"].trim(),
                                        image: excel_as_json[R]["Image"],
                                        answer: excel_as_json[R]["answer"].trim(),
                                        comments: excel_as_json[R]["comments"].trim(),
                                        options: [],
                                    });
                                    var j = 0;
                                    console.log(testArray)
                                    for (var key in excel_as_json[i - 1]) {
                                        j++;
                                        if (key.startsWith('option')) {
                                            testArray[i - 1].options.push(excel_as_json[i - 1][key].trim());
                                            var index = Object.keys(excel_as_json[i - 1]).indexOf(key);
                                            if (i == excel_as_json.length && Object.keys(excel_as_json[i - 1]).length == j) {
                                                Test.findOneAndUpdate({ testName: req.body.testName.trim() }, { tests: testArray }).exec(function (err, doc) {
                                                    console.log("DOC.................." + doc + "inedex" + index + "i....." + i);
                                                    if (err) { console.log(err); res.send(500, { message: 'Updation failure happened for ' }) }
                                                    res.status(200).json({
                                                        success: 'Test has been Updated.'
                                                    });
                                                });
    
                                            }
                                        }
                                        else {
                                            if (i == excel_as_json.length && Object.keys(excel_as_json[i - 1]).length == j) {
                                                Test.findOneAndUpdate({ testName: req.body.testName.trim() }, { tests: testArray }).exec(function (err, doc) {
                                                    console.log("DOC.................." + doc + "inedex" + index + "i....." + i);
                                                    if (err) { console.log(err); res.send(500, { message: 'Updation failure happened for ' }) }
                                                    res.status(200).json({
                                                        success: 'Test has been Updated.'
                                                    });
                                                });
    
                                            }
                                        }
    
                                    }
                                    i++;
                                }
                            }
                            else{
                                res.status(200).json({
                                    success: 'Test has been Updated.'
                                });
                            }
                            
                        });
                    }
                    else {
                        if(req.body.testFile!=undefined && req.body.testFile.length>0){
                        const test = new Test({
                            _id: new mongoose.Types.ObjectId(),
                            testName: req.body.testName.toUpperCase(),
                            testDuration: req.body.testDuration,
                            testType: req.body.testType,
                            noOfQstn: req.body.noOfQstn,
                            tests: []
                        });

                        var workbook = XLSX.read(req.body.testFile, { type: 'base64' });
                        var first_sheet_name = workbook.SheetNames[0];
                        /* Get worksheet */
                        var worksheet = workbook.Sheets[first_sheet_name];
                        var excel_as_json = XLSX.utils.sheet_to_json(worksheet);
                        console.log(worksheet['B2'])
                        var testArray = []
                        var i = 0;
                        console.log(excel_as_json);
                        for (var R = 0; R < excel_as_json.length; R++) {
                            test.tests.push({
                                question: excel_as_json[R]["Question"],
                                image: excel_as_json[R]["Image"],
                                answer: excel_as_json[R]["answer"],
                                comments: excel_as_json[R]["comments"],
                                options: [],
                            });
                            for (var key in excel_as_json[i]) {

                                if (key.startsWith('option')) {
                                    test.tests[i].options.push(excel_as_json[i][key]);
                                    var index = Object.keys(excel_as_json[i]).indexOf(key);
                                    if (R == excel_as_json.length - 1 && excel_as_json[i][index + 1] == undefined) {
                                        test.save().then(function (result) {
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
                    else{
                        res.status(200).json({
                            success: 'Test File not uploaded.'
                        });
                    }
                }
               
                })
        }
    })
}

//Update approval api
exports.AssignTest = function (req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');

    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err, decoded) {

        if (err) { console.log(err); return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' }) }
        else {
            var errorMessage = [];
            console.log(req.body);
            //assignTestCall(req.body.email,req.body.test,res);
            User.findOneAndUpdate({ 'email': req.body.email }, { $push: { tests: { testName: req.body.test, assigneddate: new Date(), answers: [] } } }).exec(function (err, doc) {
                if (err) { console.log(err); return res.send(500, { message: 'Updation failure happened for ' + req.body.email }); }
                else return res.send({ "success": "succesfully saved" });
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
var assignTestCall = function (email, testName, res) {
    User.findOneAndUpdate({ 'email': email }, { $push: { tests: { testName: testName, assigneddate: new Date(), answers: [] } } }).exec(function (err, doc) {
        if (err) { console.log(err); return res.send(500, { message: 'Updation failure happened for ' + req.body.email }); }
        // else return res.send({"success":"succesfully saved"});
    })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                error: error
            });
        });
}

exports.AssignTestBulk = function (req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');

    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err) {

        if (err) { console.log(err); return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' }) }
        else {
            var workbook = XLSX.read(req.body.excel, { type: 'base64' });
            var first_sheet_name = workbook.SheetNames[0];
            /* Get worksheet */
            var worksheet = workbook.Sheets[first_sheet_name];
            var excel_as_json = XLSX.utils.sheet_to_json(worksheet);
            var i = 0;
            var assignedDet = [];
            for (var R = 0; R < excel_as_json.length; R++) {
                var testList = excel_as_json[R]["TestList"].split(",");
                console.log(testList);
                for (var c = 0; c < testList.length; c++) {
                    // assignTestCall(excel_as_json[R]["StudentEmail"],testList[c],res);

                    console.log(testList[c]);
                    User.findOneAndUpdate({ 'email': excel_as_json[R]["StudentEmail"] }, { $push: { tests: { testName: testList[c].toUpperCase(), assigneddate: new Date(), answers: [] } } }).exec(function (err, doc) {
                        if (err) { console.log(err); return res.send(500, { message: 'Updation failure happened for ' + req.body.email }); }
                        //   else return res.send({"success":"succesfully saved"});
                    })
                    if (R == excel_as_json.length - 1 && c == testList.length - 1) {
                        return res.send({ "success": "succesfully saved" });
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

exports.DeleteTest = function (req, res) {

    console.log(req.body.test);
    var token = req.get('Authorization').replace(/^Bearer\s/, '');

    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err) {

        if (err) { console.log(err); return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' }) }
        else {
            var errorMessage = [];
            Test.find({ 'testName': req.body.test }).remove(function (err, doc) {
                if (err) { console.log(err); return res.send(500, { message: 'failed to remove ' + req.body.test }); }
                else return res.send({ "success": "succesfully deleted" });
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

exports.getBatchName = function (req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');

    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err) {

        if (err) { console.log(err); return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' }) }
        else {
            var batchName = [];
            Batch.find({}, function (err, btch) {
                if (err) {
                    res.status(500).json({
                        error: "Error happened while fetching data"
                    });
                }
                else {
                    console.log(btch.map(o => o.batchName))
                    res.status(200).json({
                        batch: btch.map(o => o.batchName)
                    });
                }
            })
        }
    })
}

exports.updateBatchName = function (req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');

    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err,decoded) {

        if (err) { console.log(err); return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' }) }
        else {
            var batchName = [];
            console.log(req.body.batchName+" "+req.body.email)
            User.findOneAndUpdate({'email':req.body.email},{$set:{batchName:req.body.batchName}}, function (err, btch) {
                if (err) {
                    res.status(500).json({
                        error: "Error happened while updating batch"
                    });
                }
                else {
                    res.status(200).json({
                       success:"Batch Name successfully updated"
                    });
                }
            })
        }
    })
}

exports.getUserDetails = function (req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');

    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err) {

        if (err) { console.log(err); return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' }) }
        else {
            var batchName = [];
            User.find({ batchName: req.body.batchName.toLowerCase() }
            ).exec().then(function (user) {
                res.status(200).json({
                    user: user
                });
            })
        }
    })
}

exports.createBatch = function (req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
console.log(req.body.batchName)
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err) {
        Batch.find({ batchName: req.body.batchName }
        ).exec().then(function (btch) {
            if (btch != undefined && btch.length > 0) {
                res.status(409).json({
                    error: "Batch already exist."
                });
            }
            else {
                const batch = new Batch({
                    _id: new mongoose.Types.ObjectId(),
                    batchName: req.body.batchName.toLowerCase(),
                });
                batch.save().then(function (result) {
                    res.status(200).json({
                        success: "Batch Created successfully"
                    });
                })
            }

        });
    });
}

exports.DeleteBatch = function (req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');

    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err) {
        Batch.find({ batchName: req.body.batchName }
        ).remove(function (err, doc) {
            if (btch != undefined && btch.length > 0) {
                if (err) { console.log(err); return res.send(500, { message: 'failed to remove ' + req.body.batchName }); }
                else return res.send({ "success": "Batch succesfully deleted" });
            }

        });
    });
}

exports.GetTestQuestion = function (req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');

    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err) {
        console.log(req.body.testName)
        Test.find({ 'testName': req.body.testName.trim() }
        ).exec()
            .then(function (tst) {
                console.log(tst);
                res.send({ "test": tst });
            })
    });
}

exports.UpdateQuestion = function (req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');

    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err) {
        Test.find({ testName: req.body.testName }
        ).exec()
            .then(function (tst) {
                for(var i=0;i<req.body.questions.length;i++){
                    console.log(req.body.questions[i].question)
                    Test.findOneAndUpdate({ "testName": req.body.testName, "tests": { $elemMatch: { "question":req.body.questions[i].question}}}, {$set: {
                        "tests.$.image":
                            req.body.questions[i].image
                    }}).exec()
                    if(i==req.body.questions.length-1){
                        res.send({ "success": "updated successfully" });
                    }
                }
            })
    });
}

exports.AssignTestByBatch = function (req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');

    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err) {
        User.find({ batchName: req.body.batchName }
        ).exec()
            .then(function (batch) {
                var emailList=batch.map(o=> {return o.email});
                console.log(emailList)
                User.update({ 'email': {$in:emailList} }, { $push: { tests: { testName: req.body.test, assigneddate: new Date(), answers: [] } } },{ multi: true }).exec(function (err, doc) {
                    if (err) { console.log(err); return res.send(500, { message: 'Updation failure happened for ' + req.body.email }); }
                    else return res.send({ "success": "succesfully saved" });
                })
            })
    });
}
