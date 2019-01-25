# Implementation Notes for Project
## MongoDB
### Mongo save
mongodump -h localhost:27017 -d nba_data_db -o db_backup
### Mongo restore
mongorestore -h ds043991.mlab.com:43991 -d heroku_4rs73gg2 -u <user> -p <password> --authenticationDatabase heroku_4rs73gg2 db_backup/*
