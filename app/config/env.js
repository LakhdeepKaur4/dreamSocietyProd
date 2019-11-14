const env = {
  database: 'greattug_dreamsecurity_prod',
  username: 'root',
  password: 'root',
  host: '192.168.0.121',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

module.exports = env;
