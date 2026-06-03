// connect to mysql database
// we need to create a database
// then we need to create a table
import mysql from "mysql2/promise";

const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "MySqlBVM007@",
  database: "mySql_db",
});

console.log("Connected to MySQL");

// create database
// await db.execute("CREATE DATABASE IF NOT EXISTS mySql_db");

// check database exists
const rows = await db.execute(`
  SHOW DATABASES`);
// console.log(rows);

// create table
// db.execute(`
//     CREATE TABLE IF NOT EXISTS mySql_db.users (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         email VARCHAR(255) NOT NULL UNIQUE
//     )
// `);
// insert data into table
// await db.execute(`
//     INSERT INTO mySql_db.users (name, email) VALUES ('John Doe', 'john.doe@example.com')
//     `);

// Using prepared statements to prevent SQL injection VALUES(?,?)
// await db.execute(`INSERT INTO mySql_db.users (name, email) VALUES (?,?)`, [
//   "ajax",
//   "ajax@example.com",
// ]);

// insert multiple data into table
// try{
//   const users = [
//     ["Alice", "alice@example.com"],
//     ["danny", "danny@example.com"]
//   ];
//   await db.query(`INSERT INTO mySql_db.users (name, email) VALUES ?`, [users]);
// }catch(error){
//     console.error('already exists');
// }

// update data
// await db.execute(`
//     UPDATE mySql_db.users SET name = ? WHERE id = ?
// `,["John",1]);

// delete data
// await db.execute(`
//     DELETE FROM mySql_db.users WHERE id = ?
// `,["3"]);

// delete database
// await db.execute(`DROP DATABASE mySql_db`);

const [data] = await db.execute(`SELECT * FROM mySql_db.users`);
console.log(data);