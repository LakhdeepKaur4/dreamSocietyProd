const env = {
  database: 'greattug_dreamsecurity_prod',
  username: 'greattug_dreamsP',
  password: 'Lucky1234##',
  host: 'greatwits.com.md-in-73.bigrockservers.com',
  dialect: 'mysql',
  pool: {
    max: 100,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// const env = {
//   database: 'greattug_dreamsecurity',
//   username: 'greattug_jitendr',
//   password: 'honda1234##',
//   host: 'greatwits.com.md-in-73.bigrockservers.com',
//   dialect: 'mysql',
//   pool: {
// 	  max: 500,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   }
// };

module.exports = env;
