const mongoose = require('mongoose');
const dotenv = require('dotenv');


process.on('uncaightException', err => {
  console.log(err);
  process.exit(1);
});

dotenv.config({ path: './config.env'});

const DB = process.env.DATABASE_LOCAL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
console.log(DB);
const app = require('./app');

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(() => console.log('DB connection successful'));



const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log (`App running on port ${port}`);
});

// Handling unhandled exceptions . Ie. database password is wrong
// process.on('unhandledRejection', err => {
//   // console.log(err.name, err.message);
//   server.close(() =>{
//       process.exit(1);
//   })
// });

// process.on('SIGTERM', () => {
//   console.log('SIGTERM RECIEVED. Shutting down server');
//   server.close(() => {
//       console.log('PROCESS TERMINATED!');
//   });
// });