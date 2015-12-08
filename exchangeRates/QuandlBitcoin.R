library(devtools)
library(Quandl)

BitcoinExchangerateData <- Quandl("BAVERAGE/BITCOIN_DEEUR", start_date="2015-01-01", end_date="2015-01-10")