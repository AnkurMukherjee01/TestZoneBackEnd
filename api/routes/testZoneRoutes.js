'use strict';

module.exports = function(app) {
  var testZone = require('../controllers/testZoneController');
  var mcqZone = require('../controllers/mcqZoneController');
  var approval= require('../controllers/admincontroller');
  var common= require('../controllers/commoncontroller');

app.route('/api/cats').post((req, res) => {
  res.send(201, req.body);
});

  // todoList Routes
  app.post('/api/login',testZone.loginCheck);

  app.post('/api/signup', testZone.signUp);

  app.post('/api/mcq',mcqZone.mcqDet);

  app.get('/api/fetchapproval',approval.fetchApproval);

  app.post('/api/updatependingapproval',approval.UpdateApproval);

  app.post('/api/bulklogin',approval.CreateBulkUser);

  app.get('/api/approvemail',approval.mailApproval);

  app.post('/api/changePassword',testZone.changePassword);

  app.post('/api/createTest',approval.CreateTest);

  app.get('/api/getTest', common.fetchTestList);

  app.post('/api/getEmployeeName',common.fetchUserName);

  app.post('/api/assigntest', approval.AssignTest);

  app.post('/api/deletetest',approval.DeleteTest);

  app.post('/api/fetchmcqtest',mcqZone.mcqFetchQuestion);

  app.post('/api/savemcqanswer',mcqZone.mcqSaveAnswer);

  app.post('/api/savemcqtest',mcqZone.mcqSaveTest);

  app.post('/api/getrank',mcqZone.mcqGetRank);

  app.post('/api/assignbulktest',approval.AssignTestBulk);

  app.get('/api/getbatchname',approval.getBatchName);

  app.post('/api/getuserdetails',approval.getUserDetails);

  app.post('/api/forgetpassword',testZone.forgetPassword);

  app.post('/api/createbatch',approval.createBatch);

  app.post('/api/gettestquestion',approval.GetTestQuestion);

  app.post('/api/updatequestion',approval.UpdateQuestion);

  app.post('/api/updatebatchname',approval.updateBatchName);

  app.post('/api/assigntestbybatch',approval.AssignTestByBatch);

  app.post('/api/assigntestbybatch',approval.AssignTestByBatch);
  
  app.post('/api/getuserreport',approval.UserReport);

  app.post('/api/changeapproval',approval.ChangeApproval);

  app.post('/api/updateUserDet',testZone.updateUserDetails);

  app.post('/api/getenquiry',approval.GetEnquiry);
    app.use(function(req, res) {
      res.status(404).send({url: req.originalUrl + ' not found'})
    });
//   app.route('/tasks/:taskId')
//     .get(todoList.read_a_task)
//     .put(todoList.update_a_task)
//     .delete(todoList.delete_a_task);
};