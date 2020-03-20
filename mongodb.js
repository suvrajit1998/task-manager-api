const mongodb = require('mongodb')
const mongodbClient = mongodb.MongoClient

const connectionUrl = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

mongodbClient.connect(
  connectionUrl,
  { useNewUrlParser: true },
  (error, client) => {
    if (error) {
      return console.log('Unable to connect to database..')
    }

    const db = client.db(databaseName)

    db.collection('users').insertOne({
      name: 'Suvra',
      age: 21
    })
  }
)
