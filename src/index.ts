#!/usr/bin/env node
'use strict';

import {Processor} from './processor';
import {Reading} from './channel';

var readline = require('readline');

var read_timeseries = function(callback)
{
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    var input = "";
    rl.on('line', function(line)
    {
        input += line;
    });

    rl.on('close', function()
    {
        var json;
        try
        {
            json = JSON.parse(input);
        }
        catch(err)
        {
            console.error();
            console.error("Fatal error: Piped input is not valid JSON!");
            console.error();
            console.error(err);
            process.exit(1);
        }

        callback(json);
    });
};

read_timeseries(function(json)
{
    var proces = new Processor();
    var readings : Reading[] = proces.process_data(json);

    console.log("Time, Value");
    readings.forEach(function(reading)
    {
        console.log(reading.time + ", " + reading.result);
    });
});
