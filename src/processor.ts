import {Reading} from './channel';

export class Processor
{
    // Processes the data after collection from threads, should be delayed until after reading.
    public process_data(data:any[][]): Reading[]
    {	
        var result:Reading[] = [];
        for(var i=0; i<data.length; i++)
        {
            if(data[i].length > 1)
				result = result.concat(this.process_data_threadWindow(data[i]));
                //result = result.concat(this.process_data_useTimeDifference(data[i]));
                //result = result.concat(this.process_data_timeSlicesMax(data));	
				//result = result.concat(this.process_data_useMax(data[i]));
                //result = result.concat(this.process_data_useAll(data[i]));
                //result = result.concat(this.process_data_useSum(data[i]));
                else
                    result = result.concat(this.process_data_single(data[i]));
        }

        return result;
    }

	// Slices data according to when every thread has replied once.
	//
	// Reading corresponds to the max of a time window:
	// Window is defined by the time between every thread having replied at least once.
	private process_data_threadWindow(data:any[]) : Reading[]
	{
		
		var rec = function(data:any[], acc:Reading[]):Reading[]
		{	
			var maxTime	= Number.NEGATIVE_INFINITY;
			var maxStartTime = Number.NEGATIVE_INFINITY;
			// Find out how long until data is available from all threads
			for(var i=0; i < data.length; i++)
			{
				if(data[i].fibTimes[0] > maxTime)
				{
					maxTime = data[i].fibTimes[0];
					maxStartTime = data[i].startTimes[0];
				}
			}

			// Add this max to the results
			acc.push({result: maxTime, time: maxStartTime});

			// Removes any reading data which happened during max reading above.
			// The splice operation is destructive by reference, so data is modified.
			var maxEndTime = maxTime + maxStartTime;

			for(var i=0; i < data.length; i++)
			{
				var cutoff = data[i].startTimes.findIndex(function(measurement:any, index:any)
					{
						var measurementEndTime = data[i].startTimes[index] + data[i].fibTimes[index];
						return (measurementEndTime > maxEndTime);
					});
				if(cutoff < 0)
				{
					// Base case, one of the threads has no more data to add.
					// Discard any remaining data by returning now.
					return acc;
				}

				// Removes the data we dont want.
				data[i].fibTimes.splice(0, cutoff);
				data[i].startTimes.splice(0, cutoff);
			}
			
			// Call recursively with the now modified data.
			return rec(data, acc);
		}

		return rec(data, []);
	}

    // Sorts all data by absolute time, and get the maximum every n 
    private process_data_timeSlicesMax(data:any[]): Reading[]
    {
        // Retrieve data as Readings
        var readings: Reading[] = [];

        readings = this.process_data_useAll(data);

        // Sort the data set.
        readings.sort(function(a,b)
                      {
                          return(a.time - b.time);
                      });

                      var slice_size = 1;

                      // Cut our data into slices for every slice_sizez ms.
                      var results: Reading[] = [];
                      for(var i = readings[0].time; i <= readings[readings.length-1].time; i+=slice_size)
                      {
                          var cutoff = (<any> readings).findIndex(function(reading)
                                                          {
                                                              return (reading.time >= (i+slice_size));
                                                          });
                                                          if(cutoff == -1)
                                                              {
                                                                  //slices.push(readings);
                                                              }
                                                              else
                                                                  {
                                                                      var slice = readings.splice(0,cutoff);
                                                                      var max = slice.reduce(function(a:number,reading:Reading){ return Math.max(a,reading.result); }, Number.NEGATIVE_INFINITY);
                                                                      results.push({result: max, time: (i*slice_size)});
                                                                  }
                      }
                      return results;
    }

    // This method finds the maximum sample at every index
    // and uses the associated absolute time.
    private process_data_useTimeDifference(data:any[]): Reading[]
    {
        var count:number = 0;
        // Creates an array with fibtimes from all threads added together
        var results:Reading[] = [];
        for(var i=0; i < data[0].fibTimes.length; ++i)
        {
            var max_time = Number.NEGATIVE_INFINITY;
            var min_time = Number.POSITIVE_INFINITY;
            for(var j=0; j < data.length; ++j)
            {
                max_time = Math.max(data[j].startTimes[i], max_time);

                min_time = Math.min(data[j].startTimes[i], min_time);
            }
            count++;
            results.push( {result: (max_time - min_time), time: count} );
        }
        return results;
    }

    // This method finds the maximum sample at every index
    // and uses the associated absolute time.
    private process_data_useMax(data:any[]): Reading[]
    {
        // Creates an array with fibtimes from all threads added together
        var results:Reading[] = [];
        for(var i=0; i < data[0].fibTimes.length; ++i)
        {
            var max = data[0].fibTimes[i];
            var max_index = 0;
            for(var j=1; j < data.length; ++j)
            {
                if(data[j].fibTimes[i] > max)
                    {
                        max = data[j].fibTimes[i];
                        max_index = j;
                    }
            }
            results.push( {result: max, time: data[max_index].startTimes[i]} );
        }
        return results;
    }


    // returns all data as Readings.
    private process_data_useAll(data:any[]): Reading[]
    {
        var results:Reading[] = [];
        for(var i=0; i < data.length; i++)
        {
            for(var j=0; j < data[i].fibTimes.length; j++)
            {
                results.push({result: data[i].fibTimes[j], time: data[i].startTimes[j] });	
            }
        }
        return results;
    }

    // Generates the sum of values from each index.
    // Time is based on latest (max) at that index
    private process_data_useSum(data:any[]): Reading[]
    {
        var results:Reading[] = [];
        for(var i=0; i < data[0].fibTimes.length; i++)
        {
            var sum = data[0].fibTimes[i];
            var start = data[0].startTimes[i];
            for(var j=1; j < data.length; j++)
            {
                if(data[j].startTimes[i] > start)
                    {
                        start = data[j].startTimes[i];
                    }
                    sum = sum + data[j].fibTimes[i];
            }
            results.push({result: sum, time: start });
        }
        return results;
    }

    // Just return the one threads samples as Readings.
    private process_data_single(data:any): Reading[]
    {
        var results:Reading[] =[];
        for(var i=0; i < data[0].fibTimes.length; i++)
        {
            results.push({result: data[0].fibTimes[i], time: data[0].startTimes[i] });
        }
        return results;
    }
}
