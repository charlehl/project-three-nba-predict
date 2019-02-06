# project-three-nba-predict
Repository for final project

# Project Overview
My goal is to use the advanced boxscores from previous nba season to train my machine learning model. Based upon this training data, I would like to be able to predict the outcome of games from the current NBA season by inputting the advanced boxscore from an NBA game.

I'd also like to be able to know what factor in the boxscore is the best predictor of a team's ability to win or lose a particular game.

For my project, I scraped data boxscore stats from nba.com.  I then did some data cleaning and formatting and stored this data into a MongoDB database.  The data was seperated such that my training data was for the past NBA season and my testing data is the current NBA season.  I also created additional collections to store certain aggregated information for use in my python flask app for my web application front-end.

For my machine learning models, I created my first model based off of the "four-factors" of basketball success, which are shooting, turnovers, rebounding and free throws.  The NBA tracks these four-factors using the stats of eFG%, TOV%, OREB% and FTRate respectively.  These factors can also be assigned to the opponent as well.  For my modified model which I entitled "My Model" is based off of the four-factors but I changed eFG% for TS% and also added DefRtg.  In addition to these features, I also changed from using a Linear Regression model to using an SGD Classifier.  The SGD classifier gave me a better R2 score on my testing data and seemed to perform well.

For my last task, I wanted to be able to predict actual NBA scores.  I used the same idea of using previous season data to train and current NBA to test.  In order to predict head-to-head matchups, I ended up using an average to predict score.  In addition, I devised an ELO ranking system hoping that, that would help me to predict score outcomes more accurately.  I tried using a linear regression model but found that it did not respond well to how I was trying to predict score.  I ended up using a Bayesian Ridge model.  The effect of shifting the coefficient weights toward zero helped to me to predict scores which are more feasible for a game.  I am currently testing my model by predicting scores and comparing them against Vegas betting lines.

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

App is deployed to Heroku at https://nba-predictor-win-loss.herokuapp.com/

# Project Future Work:
I would like to in the future improve upon my score prediction model.  I didn't adjust parameters for the Baysesian Ridge model and would like to add other models and make comparisons.

