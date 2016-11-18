export interface Channel
{
	init(callback:Callback): void;
	destruct(callback:Callback): void;
	reading?: {(time:number, callback:ReadCallback): void};
    raw_reading?: {(time:number, callback:ReadRawCallback): void};
	calibrate(callback:Callback, difficulty?: number): void;
	load(millis:number): void;
}

export interface Reading
{
	result:number;
	time:number;
}

export interface Callback
{
	(err ?: string, msg ?: number): void;
}

export interface ReadCallback
{
	(result:Reading[], meta ?: Object, err ?: string): void;
}

export interface ReadRawCallback
{
	(result:string, meta ?: Object, err ?: string): void;
}
