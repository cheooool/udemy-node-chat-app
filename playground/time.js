var moment = require('moment');

// var date = moment();
// date.add(100, 'year').subtract(9, 'month');
// console.log(date.format('YYYY.MM.DD'));;

var someTimestamp = moment().valueOf();
console.log(someTimestamp);

var createAt = 1234;
var date = moment(createAt);
console.log(date.format('h:mm a'));