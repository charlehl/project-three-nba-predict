# project-three-nba-predict
Repository for final project

# Project Overview
My goal is to use the advanced boxscores from previous nba season to train my machine learning model. Based upon this training data, I would like to be able to predict the outcome of games from the current NBA season by inputting the advanced boxscore from an NBA game.

I'd also like to be able to know what factor in the boxscore is the best predictor of a team's ability to win or lose a particular game.

For my project, I scraped data boxscore stats from nba.com.  I then did some data cleaning and formatting and stored this data into a MongoDB database.  The data was seperated such that my training data was for the past NBA season and my testing data is the current NBA season.  I also created additional collections to store certain aggregated information for use in my python flask app for my web application front-end.

For my machine learning models, I created my first model based off of the "four-factors" of basketball success, which are shooting, turnovers, rebounding and free throws.  The NBA tracks these four-factors using the stats of eFG%, TOV%, OREB% and FTRate respectively.  These factors can also be assigned to the opponent as well.  For my first model I decided to use a logistical regression model.  The model tested with an R2 score of 0.9351 on my testing data.

# Directory structure:
### Exploratory
Added ability to scrape data from nba.com for all boxscores for 2017-2018 NBA season in jupyter notebook and current season.
Also added machine learning models creation and saving.
Created backend db to store info and also stats info for flask api use for front-end webpage.

### db_backup
Store my database backend data here.  Used later to upload to heroku app.

### nba_flask_app
Flask app for final project.  App contains info on project.  predictor for nba current season records and head to head predictor.
Also display stats comparison for visual view of data.

# Shortcomings/Future Work
In the future I would like to add additional models in order to be able to predict the actual score of a head-to-head game.  Currently, I only predict the record based off of box stats for games and also the winner of a head-to-head match up based on team stats.  In the future, I would also like to add additional features to my models that would be able to take into account current team performance.  For instance, I would like to add an ability to calculate team ELO and use that as a predictor for my model. 
