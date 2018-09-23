var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000;
  const bodyParser = require('body-parser');
//   app.use(function(req, res, next){
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'X-Requested-With');
//     next();
// })
app.listen(port);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cors = require('cors')
global.senderEmail='completeanalytics@gmail.com'
global.auth={
  user: senderEmail,
  pass: 'CARS@201106'
}
// global.senderEmail='mukherjeenkur@gmail.com'
// global.auth={
//   user: senderEmail,
//   pass: 'jibontori'
// }

var corsOptions = {
 origin: '*',
  // origin: ['https://139.59.74.138/api/signup','https://139.59.74.138/api/signup','https://139.59.74.138/api/login','https://139.59.74.138/api/mcq','https://139.59.74.138/api/fetchapproval',
  // 'https://139.59.74.138/api/updatependingapproval','https://139.59.74.138/api/bulklogin','https://139.59.74.138/api/changePassword','https://139.59.74.138/api/createTest',
  // 'https://139.59.74.138/api/getTest','https://139.59.74.138/api/savemcqtest','https://139.59.74.138/api/getrank','https://139.59.74.138/api/assignbulktest',
  // 'https://139.59.74.138/api/getEmployeeName','https://139.59.74.138/api/assigntest','https://139.59.74.138/api/deletetest',
  // 'https://139.59.74.138/api/fetchmcqtest','https://139.59.74.138/api/savemcqanswer','https://139.59.74.138/api/getbatchname','https://139.59.74.138/api/getuserdetails'],//prod
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

app.use(cors(corsOptions))
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/testzone',{ useNewUrlParser: true });



var routes = require('./api/routes/testZoneRoutes'); //importing route
routes(app);


console.log('todo list RESTful API server started on: ' + port);