# install.packages("testthat")
library(testthat)
setwd("R")
getwd()
source("library.R");

# create dataframe filled with full year from 1990 to 2000, dates within those years, month, week number temperature and precipitation with coloumn length of 10
df = data.frame(
    date = seq(as.Date("1990-01-01"), as.Date("2000-12-31"), by = "day"),
    month = format(seq(as.Date("1990-01-01"), as.Date("2000-12-31"), by = "day"), "%m"),
    week = format(seq(as.Date("1990-01-01"), as.Date("2000-12-31"), by = "day"), "%U"),
    temperature = runif(4018, -20, 40),
    precipitation = runif(4018, 0, 100)
)
# mutate df to have a column with year for each date
df$year <- format(df$date, "%Y")

tags = c("temperature", "precipitation", "year", "month", "week", "date")
test_that( desc = "Precipitation is more then snow", code = {
    result <- estSnow(df, tags, "week")
    result
    expect_true(sum(df$precipitation) > sum(result$snow))
})
test_that(desc = "Snow removes all positive temperature values", code = {
    result <- estSnow(df, tags, "week")
    expect_true(all(result$temperature <= 0))
})
growingSeason(df, c("temperature", "precipitation", "year", "month", "week", "date"), "week")
test_that(desc = "Growing Season create new column with growing season in weeks", code = {
    result <- growingSeason(df, tags, "week")
)}