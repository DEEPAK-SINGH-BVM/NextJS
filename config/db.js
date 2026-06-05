import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "nextjswithmysql",
});

try {
  const connection = await db.getConnection();
  console.log("Connected to the database successfully!");
  connection.release(); // connection ko wapas pool me return karta hai (free kar deta hai reuse ke liye)
} catch (err) {
  console.error("Error connecting to the database:", err);
  process.exit(1); // app ko immediately stop kar deta hai (error aaya hai isliye server band)
}

export default db;
