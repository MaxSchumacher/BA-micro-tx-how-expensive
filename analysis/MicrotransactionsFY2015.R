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

# load transaction data
FullYear2015 <- read.csv("../data/FullYear2015.csv")

# Adjust headers
Transaction_Data_headings <- c('date','volume', 'transaction_costs')
names(FullYear2015) <- Transaction_Data_headings

# Convert Unix date in transaction data to Date format
FullYear2015$date <- as.POSIXlt(FullYear2015$date, origin="1970-01-01", tz="GMT")
# Cut out day-times and only store Date per transaction
FullYear2015$date <- strptime(FullYear2015$date, "%Y-%m-%d")
# Store Date in Date format.
FullYear2015$date <- as.Date(FullYear2015$date)

# Merge dataset over data variable.
MergedDataFrame <- merge(FullYear2015, exchangeYearsUSDFullYear2015, by = "date", all = TRUE)

# Convert volumes and transaction_fees from BTC to USD.
TransactionDataInDollar <- data.frame(MergedDataFrame$date, 
                                      MergedDataFrame$volume * MergedDataFrame$exchange_rate_in_Dollar,
                                      MergedDataFrame$transaction_costs * MergedDataFrame$exchange_rate_in_Dollar)

# Include Meaningful names for new dataset
TransactionDataDollarHeaders <- c('date', 'transaction_volume', 'transaction_costs')
names(TransactionDataInDollar) <- TransactionDataDollarHeaders

# Extract microtransactions from overall dataset.
microtransaction2015 <- subset(TransactionDataInDollar, transaction_volume <= 5)

lessThanOneDollar <- subset(TransactionDataInDollar, transaction_volume <= 1)
# Over the entire timeframe, what percentage of transactions are microtransactions?
ShareOfMicrotransactions <- nrow(microtransaction2015)/nrow(TransactionDataInDollar)

# Create stacked area graph for 2015 with 5-4, 4-3, 3-2; 2-1; 1-0 microtransaction sizes.

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
  coord_fixed(ratio=30) +
  #remove gridlines
  theme(panel.grid.minor=element_blank(),
        panel.grid.major=element_blank(),
        axis.title.x = element_text(size=17),
        axis.title.y = element_text(size=17)
        )