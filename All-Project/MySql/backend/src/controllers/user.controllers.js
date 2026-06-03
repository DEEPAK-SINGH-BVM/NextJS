import  db  from "../config/db.js";
export const getUser = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM users`);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const [result] = await db.query(
      `INSERT INTO users (name,email) VALUES (?,?)`,
      [name, email],
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const [result] = await db.query(
      `UPDATE users SET name=? ,email=? WHERE id=?`,
      [name, email, id],
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(`DELETE FROM users WHERE id=?`, [id]);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};