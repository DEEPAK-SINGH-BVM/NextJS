CREATE DATABASE school;
USE school;

CREATE TABLE dept(
	id INT PRIMARY KEY,
    name VARCHAR(50)
);
INSERT INTO dept VALUES(1,"english"),(2,"IT");
SELECT * FROM dept;

UPDATE dept SET id = 2 WHERE id = 4;

CREATE TABLE teacher (
	id INT PRIMARY KEY,
    name VARCHAR(50),
    dept_id INT, 
    FOREIGN KEY (dept_id) REFERENCES dept(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);
DROP TABLE teacher;
INSERT INTO teacher VALUES(1,"addam",1),(2,"bob",4);

SELECT * FROM teacher;