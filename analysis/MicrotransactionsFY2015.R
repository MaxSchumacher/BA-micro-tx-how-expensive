# set working directory to /BA-micro-tx-how-expensive/analysis for relative paths to work. use setwd()

# load exchange rate data.
exchangeYearsUSDFullYear2015 <- read.csv("../data/BTCexchangeRate2015FromBlockchainINFO.csv")

# select relevant subset (Date and exchange-rate at market opening) and save Date in Date format.
exchangeYearsUSDFullYear2015 <- data.frame(as.Date(exchangeYearsUSDFullYear2015$Date), exchangeYearsUSDFullYear2015$Value)

# provide meaningful headers
exchange_rate_headings <- c('date', 'exchange_rate_in_Dollar')
names(exchangeYearsUSDFullYear2015) <- exchange_rate_headings

# sort by timestamp (January 1st on top)
exchangeYearsUSDFullYear2015 <- exchangeYearsUSDFullYear2015[order(exchangeYearsUSDFullYear2015$date) , ]

#----------------------------------------------------------------------------------------------------------

# import batches based on fetchTransaction script.
FullYear2015 <- read.csv("../data/FullYear2015.csv")
laterYear <- read.csv("../data/AugustToEndOfYear.csv")
december2015 <- read.csv("../data/December2015.csv")

# Adjust headers
Transaction_Data_headings <- c('date','volume', 'transaction_costs')
names(FullYear2015) <- Transaction_Data_headings
names(laterYear) <- Transaction_Data_headings
names(december2015) <- Transaction_Data_headings

# Convert Unix date in transaction data to Date format
FullYear2015$date <- as.POSIXlt(FullYear2015$date, origin="1970-01-01", tz="GMT")
laterYear$date <- as.POSIXlt(laterYear$date, origin="1970-01-01", tz="GMT")
december2015$date <- as.POSIXlt(december2015$date, origin="1970-01-01", tz="GMT")

# Cut out day-times and only store Date per transaction
FullYear2015$date <- strptime(FullYear2015$date, "%Y-%m-%d")
laterYear$date <- strptime(laterYear$date, "%Y-%m-%d")
december2015$date <- strptime(december2015$date, "%Y-%m-%d")

# Store Date in Date format.
FullYear2015$date <- as.Date(FullYear2015$date)
laterYear$date <- as.Date(laterYear$date)
december2015$date <- as.Date(december2015$date)

#subset data by date.
JanuaryToAugst <- subset(FullYear2015, date <= "2015-07-31")
AugustToJanuary <- subset(laterYear, date > "2015-07-31" & date < "2015-12-01")
December <- subset(december2015, date >= "2015-12-01")

#combine datasets
FinalComplete2015 <- rbind(JanuaryToAugst, AugustToJanuary, December) #write to disk & publish on Github

# Merge dataset over data variable.
MergedDataFrame <- merge(FinalComplete2015, exchangeYearsUSDFullYear2015, by = "date", all = TRUE)

# Convert volumes and transaction_fees from BTC to USD.
TransactionDataInDollar <- data.frame(MergedDataFrame$date, 
                                      MergedDataFrame$volume * MergedDataFrame$exchange_rate_in_Dollar,
                                      MergedDataFrame$transaction_costs * MergedDataFrame$exchange_rate_in_Dollar)

# Include Meaningful names for new dataset
TransactionDataDollarHeaders <- c('date', 'transaction_volume', 'transaction_costs')
names(TransactionDataInDollar) <- TransactionDataDollarHeaders

#----------------------------------------------------------------------------------------------------------

#write.csv(TransactionDataInDollar, "Transactions2015SampleInDollar")

#----------------------------------------------------------------------------------------------------------

# Extract microtransactions from overall dataset.
microtransaction2015 <- subset(TransactionDataInDollar, transaction_volume <= 5)
lessThanOneDollar <- subset(TransactionDataInDollar, transaction_volume <= 1)
# Over the entire timeframe, what percentage of transactions are microtransactions?

ShareOfMicrotransactions <- nrow(microtransaction2015)/nrow(TransactionDataInDollar)

# stacked area graph for 2015 with 5-4, 4-3, 3-2; 2-1; 1-0 microtransaction sizes.

#----------------------------------------------------------------------------------------------------------

library(dplyr)
library(ggplot2)
breaks <- c(0, 1, 2, 3, 4, 5)

microtransaction2015 %>% 
  # create two week intervals.
  mutate(TwoWeekInterval=ceiling(as.numeric(format(date, '%j'))/7)) %>%
  mutate(Class=factor(findInterval(transaction_volume, breaks))) %>%
  group_by(TwoWeekInterval, Class) %>%
  # count per group
  summarise(n=n()) %>%
  # expressed as proportions
  mutate(Proportion=n/sum(n)) %>%
  ggplot(aes(x=TwoWeekInterval,
             y=Proportion, 
             fill=Class)) + 
  # line thickness & color opacity
  geom_area(colour="black", 
            size=.6) +
  
  ylab("Proportion of transactions") +
  guides(fill = guide_legend(reverse=TRUE)) +
  scale_x_discrete(name="full year 2015 in two-week intervals") +
  # Legend description
  scale_fill_brewer(palette="Set1", 
                    guide = guide_legend(reverse=TRUE), 
                    name="Classes (USD)",
                    labels=c("0-1", "1-2", "2-3", "3-4", "4-5")) +
  coord_fixed(ratio=20) +
  #remove gridlines
  theme(panel.grid.minor=element_blank(),
        panel.grid.major=element_blank(),
        axis.title.x = element_text(size=17),
        axis.title.y = element_text(size=17)
        )

#----------------------------------------------------------------------------------------------------------

#stacked area graph for sub $1 transactions.
library(dplyr)
library(ggplot2)
breaks <- c(0.2, 0.4, 0.6, 0.8, 1)

lessThanOneDollar %>% 
  # create two week intervals.
  mutate(TwoWeekInterval=ceiling(as.numeric(format(date, '%j'))/7)) %>%
  mutate(Class=factor(findInterval(transaction_volume, breaks))) %>%
  group_by(TwoWeekInterval, Class) %>%
  # count per group
  summarise(n=n()) %>%
  # expressed as proportions
  mutate(Proportion=n/sum(n)) %>%
  ggplot(aes(x=TwoWeekInterval,
             y=Proportion, 
             fill=Class)) + 
  # line thickness & color opacity
  geom_area(colour="black", 
            size=.6) +
  
  ylab("Proportion of transactions") +
  guides(fill = guide_legend(reverse=TRUE)) +
  scale_x_discrete(name="full year 2015 in two-week intervals") +
  # Legend description
  scale_fill_brewer(palette="Reds", 
                    guide = guide_legend(reverse=TRUE), 
                    name="Classes (USD)",
                    labels=c("0-0.2", "0.2-0.4", "0.4-0.6", "0.6-0.8", "0.8-1")) +
  coord_fixed(ratio=20) +
  #remove gridlines
  theme(panel.grid.minor=element_blank(),
        panel.grid.major=element_blank(),
        axis.title.x = element_text(size=17),
        axis.title.y = element_text(size=17)
  )

#----------------------------------------------------------------------------------------------------------

#Transaction Cost Percentage vs. volume.

volumeVsPercentageCostWithDate <- data.frame(microtransaction2015$date,
                                             microtransaction2015$transaction_volume,
                                             microtransaction2015$transaction_costs/microtransaction2015$transaction_volume
                                            )

volumeVsPercentageCostHeaders <- c('date', 'transaction_volume','transaction_costs_in_Percent')
names(volumeVsPercentageCostWithDate) <- volumeVsPercentageCostHeaders

ggplot(volumeVsPercentageCostWithDate, aes(x=transaction_volume, 
                                   y=transaction_costs_in_Percent)) +
                                   geom_point(size=0.05) +
                                   stat_smooth(colour="red") + #include line showing average
                                  theme(
                                   axis.title.x = element_text(size=17),
                                   axis.title.y = element_text(size=17)) +
                                   xlab("Transaction volume in USD") +
                                   ylab("Transaction cost in Percent")
    

#----------------------------------------------------------------------------------------------------------
#install.packages("xts")
library(xts)

#Plot network Utilization over one year.
networkUtilizationPerDay <- read.csv("../data/AverageBlockSize.csv") #potentially crude approxmiation

networkUtilizationPerDay <- data.frame(as.Date(networkUtilizationPerDay$Date),
                                       networkUtilizationPerDay$Value)

network_utilization_as_percent_of_maximum <- xts(networkUtilizationPerDay[,-1], order.by=networkUtilizationPerDay[,1])

#----------------------------------------------------------------------------------------------------------

#Show average Percentage transaction cost per microtransaction summarized daily:


percentageCostasXTS <-as.xts(as.data.frame(volumeVsPercentageCostWithDate$transaction_costs_in_Percent),
                            order.by=as.Date(volumeVsPercentageCostWithDate$date))

# calculate daily mean
dailyAveragePcTXCost <- apply.daily(percentageCostasXTS, mean) #requires xts to work.
names(dailyAveragePcTXCost) <- c("Daily Average Transaction Cost")

#----------------------------------------------------------------------------------------------------------

# Plot both network utilization and percentage Cost per day:

# Plot daily average TxCost
autoplot.zoo(merge(dailyAveragePcTXCost, network_utilization_as_percent_of_maximum)) + 
  geom_line(colour="blue")
  theme(panel.background = element_blank()) +
  theme_bw() +
  xlab("Full Year 2015")

#----------------------------------------------------------------------------------------------------------

# What percentage of microtransactions has costs of 1% or less?

subset(TransactionDataInDollar, transaction_volume <= 5)
OrderedPercentageTransactionCosts <- volumeVsPercentageCostWithDate[order(volumeVsPercentageCostWithDate$transaction_costs_in_Percent) , ]
nrow(subset(OrderedPercentageTransactionCosts, OrderedPercentageTransactionCosts$transaction_costs_in_Percent < 0.01))/nrow(microtransaction2015)

