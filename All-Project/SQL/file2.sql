CREATE DATABASE company; 
USE company;
CREATE TABLE employee(
	id INT PRIMARY KEY,
    -- id INT,
    name VARCHAR(50),
    salary INT UNSIGNED
    -- PRIMARY KEY(id,name) -- combine key  
);

INSERT INTO employee(id,name,salary) VALUES(5,"cat",3000),(4,"DJ",4000);

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