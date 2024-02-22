library(dplyr)

# NOTE: standard format for all functions
# df = data.frame
# tags; c("temperature", "humidity", "pressure", "wind_speed", "wind_direction", "rain", "snow", "clouds", "visibility", "growing_season")
# sort; "week", "month", "year" or "date"


estSnow <- function(df, tags, sort) {
    df <- df[tags] %>%
        filter(temperature <= 0) %>%
        mutate(snow = precipitation)
    return(df)
}

# growing season calculation
# NOTE: ClimInd::gsl function an alternative
growingSeason <- function(df, tags, sort) {
    df <- df[tags] %>%
        sort_by(c("year", sort)) %>%
        summarise(growing_season = sum(temperature > 5))
    return(df)
}
