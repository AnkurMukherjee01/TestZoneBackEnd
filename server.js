var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000;
  const bodyParser = require('body-parser');

app.listen(port);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cors = require('cors')

var corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

app.use(cors(corsOptions))
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/testzone',{ useNewUrlParser: true });



var routes = require('./api/routes/testZoneRoutes'); //importing route
routes(app);


console.log('todo list RESTful API server started on: ' + port);