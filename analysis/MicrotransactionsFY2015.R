# set working directory to /BA-micro-tx-how-expensive/analysis for relative paths to work. setwd()

#load exchange rate data.
exchangeYearsUSDFullYear2015 <- read.csv("../data/BTCexchangeRate2015FromBlockchainINFO.csv")

#select relevant subset (Date and exchange-rate at market opening) and save Date in Date format.
exchangeYearsUSDFullYear2015 <- data.frame(as.Date(exchangeYearsUSDFullYear2015$Date), exchangeYearsUSDFullYear2015$Value)

#provide meaningful headers
exchange_rate_headings <- c('date', 'exchange_rate_in_Dollar')
names(exchangeYearsUSDFullYear2015) <- exchange_rate_headings

#sort by timestamp (January 1st on top)
exchangeYearsUSDFullYear2015 <- exchangeYearsUSDFullYear2015[order(exchangeYearsUSDFullYear2015$date) , ]

#load transaction data
FullYear2015 <- read.csv("../data/FullYear2015.csv")

#Adjust headers
Transaction_Data_headings <- c('date','volume', 'transaction_costs')
names(FullYear2015) <- Transaction_Data_headings

#Convert Unix date in transaction data to Date format
FullYear2015$date <- as.POSIXlt(FullYear2015$date, origin="1970-01-01", tz="GMT")
# Cut out day-times and only store Date per transaction
FullYear2015$date <- strptime(FullYear2015$date, "%Y-%m-%d")
# Store Date in Date format.
FullYear2015$date <- as.Date(FullYear2015$date)

MergedDataFrame <- merge(FullYear2015, exchangeYearsUSDFullYear2015, by = "date", all = TRUE)

TransactionDataInDollar <- data.frame(MergedDataFrame$date, 
                                      MergedDataFrame$volume * MergedDataFrame$exchange_rate_in_Dollar,
                                      MergedDataFrame$transaction_costs * MergedDataFrame$exchange_rate_in_Dollar)

TransactionDataDollarHeaders <- c('date', 'transaction_volume', 'transaction_costs')
names(TransactionDataInDollar) <- TransactionDataDollarHeaders

microtransaction2015 <- subset(TransactionDataInDollar, transaction_volume <= 5)

ShareOfMicrotransactions <- nrow(microtransaction2015)/nrow(TransactionDataInDollar);

#Plot these findings.

shareOfMicrotransactions <- numberOfMicrotransactions/numberOfTransactions;
# vector[x:y] allows for ranges to be defined

#install.packages('ggplot2', dependencies = T)
library(ggplot2)

es$percentage_fee <- res$
  ggplot(res , aes(x=res$percentage_fee)) +
  geom_histogram(binwidth=0.5, colour="black", fill="white")

ggplot(res, aes(x = res$volume, y = res$percentage_fee)) +
  geom_point(shape=1) +
  geom_smooth(method=lm)