var https = require('https');

var CoinbaseExchange = require('coinbase-exchange');
var publicClient = new CoinbaseExchange.PublicClient();
var sortedData = [];

var ExchangeRates = publicClient.getProductHistoricRates(
	{
	'start': '2015-01-01',
	'end'  : '2015-01-10',
	'granularity': 50000
	},
	function(err, res, data) {
		console.log(data);
		for (var i = 0; i <= data[0].length; i++) {

			//UnixTimeConverter(data, i);
		};

	}
);

function UnixTimeConverter(timestamp, entry) {
	// there must be an easier way to convert unix-timestamps to human understandble format.
	var date = new Date(timestamp[entry][0]);
	/*
	var day = date.getDay();
	var month = date.getMonth() + 1;
	var hours = date.getHours();
	var year = date.getYear();
	var minutes = "0" + date.getMinutes();
	var formattedTime = day + ' ' + month + ' ' + year + ' ' + hours + ':' + minutes.substr(-2);
	console.log(formattedTime + ' ' + timestamp[entry][3]);
	*/
	console.log(date);
}
