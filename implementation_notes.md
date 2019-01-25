# Implementation Notes for Project
## MongoDB
mongodump -h localhost:27017 -d nba_data_db -o db_backup
mongorestore -h ds225294.mlab.com:25294 -d heroku_9cs4xj21 -u <user_name> -p <password> --authenticationDatabase heroku_9cs4xj21 dump_dir/*
