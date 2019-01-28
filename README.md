# project-three-nba-predict
Repository for final project

# Project Overview
My goal is to use the advanced boxscores from previous nba season to train my machine learning model.
Based upon this training data, I would like to be able to predict the outcome of games from the current NBA season
by inputting the advanced boxscore from an NBA game.

I'd also like to be able to know what factor in the boxscore is the best predictor of a team's ability to win or lose
a particular game.

# Directory structure:
### Exploratory
Added ability to scrape data from nba.com for all boxscores for 2017-2018 NBA season in jupyter notebook and current season.
Also added machine learning models creation and saving.
Created backend db to store info and also stats info for web use.

### db_backup
Store my database backend data here.  Used later to upload to heroku app

### nba_flask_app
Flask app for final project.  App contains info on project.  predictor for nba current season records and head to head predictor.
Also display stats comparison for visual view of data.
