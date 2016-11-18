import {Processor} from './processor';
import {Reading} from './channel';

var fs = require('fs');
var data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

var proces = new Processor();
var readings : Reading[] = proces.process_data(data);

console.log("Time, Value");
readings.forEach(function(reading)
{
    console.log(reading.time + ", " + reading.result);
});
