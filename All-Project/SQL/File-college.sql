CREATE DATABASE newCollege;
USE newcollege;

CREATE TABLE student(
	rollno INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT, 
    grade VARCHAR(50), 
    city VARCHAR(50)
);

-- DROP TABLE student;

INSERT INTO student(rollno,name,marks,grade,city) VALUES(5,"ajex",90,"A","pune"),
(6,"bob",90,"A","surat"),
(7,"casly",90,"A","surat"),
(8,"danny",90,"A","surat");

-- SELECT name , marks FROM student;
SELECT * FROM student WHERE marks > 70;
SELECT * FROM student WHERE marks > 70 AND city = "surat";
SELECT * FROM student WHERE marks BETWEEN 70 AND 80;
SELECT * FROM student WHERE city IN ("pune");
SELECT * FROM student WHERE city NOT IN("surat");
SELECT * FROM student LIMIT 2;

SELECT * FROM student ORDER BY marks ASC LIMIT 5;
SELECT MAX(marks) FROM student;
SELECT DISTINCT city FROM student;
SELECT city,count(rollno) FROM student GROUP BY city;
SELECT city,avg(marks) FROM student GROUP BY city ORDER BY AVG(marks) ASC;
SELECT city,count(rollno) FROM student GROUP BY city HAVING MAX(marks) > 90;
SET SQL_SAFE_UPDATES = 0;
UPDATE student SET grade = "O" WHERE grade= "A";
UPDATE student SET marks = marks + 1;
UPDATE student SET marks = 12 WHERE marks = 92; 
DELETE FROM student WHERE marks < 33;
SELECT * FROM student;
