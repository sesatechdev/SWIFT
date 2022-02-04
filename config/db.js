const dotenv = require("dotenv");
const mysql = require("mysql");
dotenv.config({ path: "./config/config.env" });


const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});
// Exports the pool variable
module.exports = pool;
