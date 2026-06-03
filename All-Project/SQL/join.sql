CREATE DATABASE collegeJoin;
-- CREATE DATABASE IF NOT EXISTS college;
USE collegeJoin;

CREATE TABLE student(
	id INT PRIMARY KEY,
    name VARCHAR(50)
);
CREATE TABLE course(
	id INT PRIMARY KEY,
    name VARCHAR(50)
);
INSERT INTO student VALUES(1,"ajex"),(2,"bob"),(3,"cally"),(4,"danny"),(5,"jeck");

INSERT INTO course VALUES(1,"english"),(2,"IT"),(7,"math"),(8,"Science"),(9,"S.S");

SELECT * FROM student;
SELECT * FROM course;

--  inner join 
SELECT * FROM student as s INNER JOIN course as c ON student.id = course.id;