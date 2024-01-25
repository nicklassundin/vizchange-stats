# TODO rscript parser of data
options(warn=-1)

#setup = function(){
#	list.of.packages <- c('ggplot2', 'readxl', 'gridExtra', 'dplyr', 'grid', 'scales', 'lubridate');
#	new.packages <- list.of.packages[!(list.of.packages %in% installed.packages()[,"Package"])]
#	if(length(new.packages)) install.packages(new.packages, repos = "https://ftp.acc.umu.se/mirror/CRAN/")
#	library(dplyr)
#}
#suppressMessages(setup());

x = function(year, month=rep(NaN, length(year)), week=rep(NaN, length(year)), min, max, avg, sum, count) {
     labels <- c('year', 'month', 'week', 'min', 'max', 'avg', 'sum', 'count')
     matrix <- matrix(c(year, month, week, min, max, avg, sum, count), length(year), 8)
     df <- as.data.frame(matrix)
}


parse = function(year, month=rep(NaN, length(year)), week=rep(NaN, length(year)), min, max, avg, sum, count) {
               df <- x(year, month, week, min, max, avg, sum, count)
               colnames(df) <- c('year', 'month', 'week', 'min', 'max', 'avg', 'sum', 'count')
               df
}

get = function(type, year, month=rep(NaN, length(year)), week=rep(NaN, length(year)), min, max, avg, sum, count) {
        df <- parse(year, month, week, min, max, avg, sum, count)
        df[[type]]
}