'use strict';
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const Test = require('../models/test.model');
//const TestDetails = require('../models/test.model');
// const TestDet = require('../models/testDetails.model');

exports.mcqDet = function (req, res) {

    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err, decoded) {

        if (err) {  return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' }) }
        else {
            User.findOne({ email: decoded.email })
                .exec()
                .then(function (user) {
                    return res.status(200).json({
                        testDet: user.tests,
                    });
                })

        }
    });

}

exports.mcqFetchQuestion = function (req, res) {

    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err, decoded) {

        if (err) { return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' }) };
        User.find({ "email": decoded.email, "tests": { $elemMatch: { "assigneddate": req.body.assignedDate, "testName": req.body.testName } } }).exec().
            then(usr => {
                if (usr != null && usr.length > 0 && (usr[0].tests.filter(o => { return new Date(o.assigneddate).getTime() == new Date(req.body.assignedDate).getTime() && o.testName == req.body.testName })[0].marks == undefined ||
                    usr[0].tests.filter(o => { return new Date(o.assigneddate).getTime() == new Date(req.body.assignedDate).getTime() && o.testName == req.body.testName })[0].marks < 0)) {
                    Test.find({ testName: req.body.testName.trim() })
                        .exec()
                        .then(function (tst) {
                                if (usr[0].tests.filter(o => { return new Date(o.assigneddate).getTime() == new Date(req.body.assignedDate).getTime() && o.testName == req.body.testName })[0].timeStarted == undefined ||
                                (new Date()).getTime() - new Date(usr[0].tests.filter(o => { return new Date(o.assigneddate).getTime() == new Date(req.body.assignedDate).getTime() && o.testName == req.body.testName })[0].timeStarted).getTime() <
                                tst[0].testDuration * 60 * 1000) {
                                if (usr[0].tests.filter(o => { return new Date(o.assigneddate).getTime() == new Date(req.body.assignedDate).getTime() && o.testName == req.body.testName })[0].timeStarted == undefined) {
                                    User.findOneAndUpdate({ "email": decoded.email, "tests": { $elemMatch: { "testName": req.body.testName, "assigneddate": req.body.assignedDate } } },
                                        { $set: { "tests.$.timeStarted": new Date() } }).exec();
                                }
                                else {

                                }

                                var promise1 = new Promise((resolve, reject) => {
                                    if (tst[0].noOfQstn != undefined) {
                                        tst[0].tests = getRandom(tst[0].tests, tst[0].noOfQstn)
                                        var exist = usr[0].tests.filter(o => { return new Date(o.assigneddate).getTime() == new Date(req.body.assignedDate).getTime() && o.testName == req.body.testName })[0].answers
                                       
                                        for (var x = 0; x < exist.length; x++) {

                                            if (tst[0].tests.filter(p => p._id == exist[x].qstnId).length == 0) {
                                                User.findOneAndUpdate({ "email": decoded.email, "tests": { $elemMatch: { "testName": req.body.testName, "assigneddate": req.body.assignedDate } } },
                                                    {
                                                        $pull: { "tests.$.answers": { "qstnId": exist[x].qstnId } }
                                                    }).exec()
                                            }
                                        }
                                        if (tst[0].tests.length == tst[0].noOfQstn) {
                                            resolve(tst)
                                        }
                                    }
                                    else {
                                        resolve(tst)
                                    }
                                });
                                promise1.then(() => {
                                    return res.status(200).json({
                                        tst: tst,
                                        existingDet: usr[0].tests.filter(o => { return new Date(o.assigneddate).getTime() == new Date(req.body.assignedDate).getTime() && o.testName == req.body.testName })
                                    })
                                })
                            }
                            else {

                                if (testSave(req.body.testName, decoded.email, req.body.assignedDate)) {
                                    return res.status(200).json({
                                        success: 'Test has been Updated.',
                                        marks: marks,
                                        totalMarks: totalMarks,
                                        comments: ansComment.filter(function (item, index, inputArray) {
                                            return inputArray.indexOf(item) == index;
                                        })
                                    });
                                }
                                // return res.status(409).json({
                                //     error: 'Already exam been taken'
                                // })
                            }

                        })
                }
                else {
                    return res.status(409).json({
                        error: 'Already exam been taken'
                    })
                }
            })


    });
}

exports.mcqSaveAnswer = function (req, res) {

    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err, decoded) {

        if (err) { return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' }) };
        User.find({ "email": decoded.email, "tests.testName": req.body.testName, "tests.assigneddate": req.body.assignedDate })
            .exec()
            .then(function (tst) {
                    if (testObjreturnvalue(tst, req.body.assignedDate, req.body.testName, req.body.answers.question, req.body.answers.qstnId) == 1) {
                    // User.update({"email": decoded.email,"tests.assigneddate":req.body.assignedDate, "tests.testName":req.body.testName},{$set:{"tests.$.duration":req.body.duration},
                    // $push:{"tests.$.answers":{"question":req.body.answers.question,"answer":req.body.answers.answer}}})
                    User.findOneAndUpdate({ "email": decoded.email, "tests": { $elemMatch: { "assigneddate": req.body.assignedDate, "testName": req.body.testName } } }, {
                        $set: {
                            "tests.$.duration":
                                req.body.duration
                        }, $push: { "tests.$.answers": { "question": req.body.answers.question, "answer": req.body.answers.answer, "qstnId": req.body.answers.qstnId } }
                    })
                        .exec(function (err, doc) {
                            return res.status(200).json({
                                success: 'Test has been Updated.'
                            });
                        })
                }
                else if (testObjreturnvalue(tst, req.body.assignedDate, req.body.testName, req.body.answers.question, req.body.answers.qstnId) == 2) {

                    User.find({
                        "email": decoded.email, "tests": {
                            $elemMatch: {
                                "assigneddate": req.body.assignedDate, "testName": req.body.testName, "answers": { $elemMatch: { "question": req.body.answers.question, "qstnId": req.body.answers.qstnId } }
                            }
                        }
                    }).exec(function (err, doc) {
                        doc[0].tests.forEach(function (o) {
                            if (o.testName == req.body.testName) {
                                var index = 0;
                                o.answers.forEach(function (o1) {
                                    if (o1.question == req.body.answers.question) {
                                        User.findOneAndUpdate({
                                            "email": decoded.email, "tests": {
                                                $elemMatch: {
                                                    "assigneddate": req.body.assignedDate, "testName": req.body.testName, "answers": { $elemMatch: { "question": req.body.answers.question, "qstnId": req.body.answers.qstnId } }
                                                }
                                            }
                                        }, {
                                                $set: {
                                                    "tests.$.duration": req.body.duration,
                                                    ["tests.$.answers." + index + ".answer"]: req.body.answers.answer
                                                }
                                            }).exec(function (err, doc) {
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
                }
                else {
                    return res.status(200).json({
                        success: 'Test not found.'
                    });
                }
            });
    });
}

exports.mcqSaveTest = function (req, res) {

    var token = req.get('Authorization').replace(/^Bearer\s/, '');

    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err, decoded) {

        if (err) { return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' }) }
        else {
            if (testSave(req.body.testName, decoded.email, req.body.assignedDate, res)) {

                return res.status(200).json({
                    success: 'Test has been Updated.',
                    marks: marks,
                    totalMarks: totalMarks,
                    comments: ansComment.filter(function (item, index, inputArray) {
                        return inputArray.indexOf(item) == index;
                    })
                });
            }
        }

    });

}

exports.mcqGetRank = function (req, res) {
    var token = req.get('Authorization').replace(/^Bearer\s/, '');
    var totalMarks = 0;
    var returnObj = [];
    var counter = 0;
    var batchName = ""

    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, 'secret', function (err, decoded) {

        if (err) {  return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' }) }
        else {

            User.find({ "tests.testName": req.body.testName }).exec().then(function (usr) {
                if (req.body.batchName != undefined) {
                    batchName = req.body.batchName
                }
                else {
                    usr.filter(o => { return o.email == decoded.email }).map(
                        function (usrBatch) {
                            batchName = usrBatch.batchName
                        });
                }
                usr.forEach(function (p) {
                    counter++;
                    if (p.batchName != undefined && p.batchName.toLowerCase() == batchName.toLowerCase()) {
                        var counter1 = 0;
                        p.tests.forEach(function (ts) {
                            if (ts.testName == req.body.testName) {
                                if (ts.marks != undefined && ts.marks > -1) {
                                    if (returnObj.filter(o => o.name == p.firstName + " " + p.lastName).length > 0) {
                                        returnObj.filter(o => o.name == p.firstName + " " + p.lastName).map(p1 => { if (p1.marks < ts.marks) p1.marks = ts.marks });
                                        counter1++;
                                        if (counter == usr.length && counter1 == p.tests.length) {

                                            return res.status(200).json({
                                                userDet: returnObj,
                                                // percentile:percentileCalc(usr,req.body.testName,decoded.email)
                                            });
                                        }
                                    }
                                    else {
                                        returnObj.push({ "name": p.firstName + " " + p.lastName, "marks": ts.marks,"totalQuestion":ts.totalQuestion });
                                        counter1++;
                                        if (counter == usr.length && counter1 == p.tests.length) {
                                            return res.status(200).json({
                                                userDet: returnObj,
                                                //  percentile:percentileCalc(usr,req.body.testName,decoded.email)
                                            });
                                        }
                                    }
                                }
                                else {
                                    counter1++;
                                    if (counter == usr.length && counter1 == p.tests.length) {
                                        return res.status(200).json({
                                            userDet: returnObj,
                                            //  percentile:percentileCalc(usr,req.body.testName,decoded.email)
                                        });
                                    }
                                }

                            }
                            else {
                                counter1++;
                                if (counter == usr.length && counter1 == p.tests.length) {
                                    return res.status(200).json({
                                        userDet: returnObj,
                                        //  percentile:percentileCalc(usr,req.body.testName,decoded.email)
                                    });
                                }
                            }
                        })

                    }
                    else {
                        if (counter == usr.length) {
                            return res.status(200).json({
                                userDet: returnObj,
                                // percentile:percentileCalc(usr,req.body.testName,decoded.email)
                            });
                        }
                    }
                })



            });


        }

    });
}


var findTestObj = function (tst, assignedDate, testName) {

    return tst[0].tests.filter(function (o) { return o.testName == testName && new Date(o.assigneddate).getTime() == new Date(assignedDate).getTime() });
}
var testObjreturnvalue = function (tst, assignedDate, testName, question, qstnId) {
    if (findTestObj(tst, assignedDate, testName) != undefined || findTestObj(tst, assignedDate, testName) != null || findTestObj(tst, assignedDate, testName) != {}) {
        if (findTestObj(tst, assignedDate, testName)[0].answers.filter(function (o) { return o.qstnId == qstnId }).length > 0) {
            return 2;
        }
        else
            return 1;
    }
    else {
        return 0;
    }
}
var percentileCalc = function (usr, testName, email) {
    return (usr.filter(o => { return o.email == email })[0].tests.filter(o => { return o.testName == testNamel })[0].marks - getMinY(usr, testName)) * 100 / (getMaxY(usr, testName) - getMinY(usr, testName))
}

function getMinY(usr, testName) {
    return usr.reduce((min, p) => p.tests.filter(o1 => o1.testName == testName)[0].marks < min ?
        p.tests.filter(o1 => o1.testName == testName)[0].marks : min, usr[0].tests.filter(o1 => o1.testName == req.body.testName)[0].marks);
}
function getMaxY(usr, testName) {
    return usr.reduce((max, p) => p.tests.filter(o1 => o1.testName == testName)[0].marks > max ?
        p.tests.filter(o1 => o1.testName == testName)[0].marks : max, usr[0].tests.filter(o1 => o1.testName == req.body.testName)[0].marks);
}

function getRandom(arr, n) {
    if (n != undefined) {
        var result = new Array(n),
            len = arr.length,
            taken = new Array(len);
        if (n > len)
            throw new RangeError("getRandom: more elements taken than available");
        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    }
    else {
        return arr
    }
}

function testSave(testName, email, assignedDate, res) {
    var marks = 0;
    var ansComment = [];
    var correctQstnId = [];
    var totalMarks = 0;
    Test.find({ testName: testName.trim() })
        .exec()
        .then(function (tste) {
            var testQuestionCounter = 0;
            if (tste[0].noOfQstn != undefined) {
                totalMarks = tste[0].noOfQstn
            }
            else {
                totalMarks = tste[0].tests.length;
            }

            var promise1 = new Promise((resolve, reject) => {
                tste[0].tests.forEach(function (ts) {
                    User.find({
                        "email": email, "tests": {
                            $elemMatch: {
                                "testName": testName, "assigneddate": assignedDate,
                                "answers": { $elemMatch: { "question": ts.question, "answer": ts.answer, "qstnId": ts._id } }
                            }
                        }
                    })
                        .exec().then(function (tsMatch) {
                            if (tsMatch != undefined && tsMatch.length > 0) {
                                marks++;
                                testQuestionCounter++;
                                correctQstnId.push(ts._id)
                                if (testQuestionCounter == tste[0].tests.length) {
                                    resolve(marks);
                                }
                            }
                            else {
                                testQuestionCounter++;

                                ansComment.push(ts.comments);
                                if (testQuestionCounter == tste[0].tests.length) {
                                    resolve(marks);
                                }
                            }


                        })
                });

            });

            promise1.then(() => {
                User.findOneAndUpdate({ "email": email, "tests": { $elemMatch: { "testName": testName, "assigneddate": assignedDate } } }, { $set: { "tests.$.duration": 0, "tests.$.marks": marks, "tests.$.date": new Date(),"tests.$.totalQuestion":totalMarks } }).exec(function (err, doc) {
                    return res.status(200).json({
                        success: 'Test has been Updated.',
                        marks: marks,
                        totalMarks: totalMarks,
                        comments: ansComment.filter(function (item, index, inputArray) {
                            return inputArray.indexOf(item) == index;
                        }),
                        correctQstnId: correctQstnId
                    });

                })

            });
        }
        );
}
