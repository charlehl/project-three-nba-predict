# Implementation Notes for Project
## Saving/Loading machine models
```python
# Saving
mymodel_filename = 'mymodel.pkl'
pickle.dump(newModel, open(mymodel_filename, 'wb'))
# Loading
my_model = pickle.load(open(mymodel_filename, 'rb'))
```
## Saving/Loading Scalar
```python
# Saving
myscaler_filename = "my_scaler.save"
joblib.dump(X_scaler, myscaler_filename)
# Loading
my_scaler = joblib.load(myscaler_filename)
```
## MongoDB
### Mongo save
    mongodump -h localhost:27017 -d nba_data_db -o db_backup
### Mongo restore
    mongorestore -h ds043991.mlab.com:43991 -d heroku_4rs73gg2 -u <user> -p <password> --authenticationDatabase heroku_4rs73gg2 db_backup/*
