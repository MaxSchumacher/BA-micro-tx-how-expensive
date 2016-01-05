library("RSQLite");
library(sqldf);


# with that dataset: plot distribution of fees & calculate average fee
#TODO: make the same query for various classes between 3 & 2.5 etc.
#TODO: Adjust to daily exchange rates (see CSV...)

con <- dbConnect(RSQLite::SQLite(), "/home/max/Documents/BA-micro-tx-how-expensive/getTransactions/December2015")

exchangeRate <- 245;

microTransactionBarrier <- (5 * 10 ^ 8) / exchangeRate; #5 dollars
microbarrierString <- toString(microTransactionBarrier);

numberOfMicrotransactions <- dbGetQuery(con, paste("SELECT COUNT(*) FROM transactions WHERE volume <", microbarrierString));
numberOfTransactions <- dbGetQuery(con, "SELECT COUNT (*) FROM transactions");

shareOfMicrotransactions <- numberOfMicrotransactions/numberOfTransactions;

print(shareOfMicrotransactions)

query <- paste("SELECT * FROM transactions WHERE volume <", microbarrierString);
res <- dbGetQuery(con, query);

# vector[x:y] allows for ranges to be defined.

plot(as.POSIXct(res[,2]), as.numeric(res[,5]));

#install.packages('ggplot2', dependencies = T)
library(ggplot2)


res$percentage_fee <- res$
ggplot(res , aes(x=res$percentage_fee)) +
  geom_histogram(binwidth=0.5, colour="black", fill="white")

ggplot(res, aes(x = res$volume, y = res$percentage_fee)) +
  geom_point(shape=1) +
  geom_smooth(method=lm)

