var express = require('express');
var app = express();

app.use(express.static(__dirname + '/'));

var PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
  console.log('Server listening on port ' + PORT);
})
