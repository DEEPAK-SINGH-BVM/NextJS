CREATE DATABASE company; 
USE company;
CREATE TABLE employee(
	-- id INT PRIMARY KEY,
    id INT,
    name VARCHAR(50),
    salary INT UNSIGNED,
    PRIMARY KEY(id,name) -- combine key  
);
--  check
CREATE TABLE student(
    id INT PRIMARY KEY,
    name VARCHAR(50),
    age INT CHECK(age >= 18)
);


DROP TABLE employee;
INSERT INTO employee(id,name,salary) VALUES(7,"dammy",3000),(6,"dammy",4000);

SELECT * FROM employee;

 -- Default

SELECT * FROM income;
CREATE TABLE IF NOT EXISTS income(
    id INT,
    salary INT DEFAULT 25000
);
INSERT INTO income(id) VALUES(4);
SELECT * FROM income;
SHOW TABLES