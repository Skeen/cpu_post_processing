import {Processor} from './processor';

var fs = require('fs');
var data = JSON.parse(fs.readFileSync('input.raw', 'utf8'));

console.log(data);

var proces = new Processor();
proces.process_data(data);	


