import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "admin",
  database: "chatter_files",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const testMySQLConnection =
  async () => {
    let connection;

    try {
      connection =
        await pool.getConnection();

      console.log(
        "MySQL connected successfully"
      );

      connection.release();

      return true;
    } catch (error) {
      console.error(
        "MySQL connection failed:",
        error.message
      );

      if (connection) {
        connection.release();
      }

      return false;
    }
  };

export default pool;