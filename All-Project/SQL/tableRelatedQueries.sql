-- CREATE DATABASE highSchool;
-- USE highSchool;

-- CREATE TABLE student(
-- 	rollno INT PRIMARY KEY,
--     name VARCHAR(50),
--     marks INT, 
--     grade VARCHAR(50), 
--     city VARCHAR(50)
-- );

-- -- DROP TABLE student;

-- INSERT INTO newstudent(rollno, name, marks, grade, city) VALUES
-- (1, "jani", 80, "A", "pune"),
-- (2, "mike", 75, "B", "mumbai"),
-- (3, "alex", 88, "A", "surat"),
-- (4, "rohan", 70, "B", "delhi"),
-- (5, "neha", 92, "A", "pune");

-- ALTER TABLE newstudent ADD COLUMN age INT;
-- ALTER TABLE newstudent DROP COLUMN stud_age;
-- ALTER TABLE newstudent RENAME TO newStudent;
-- ALTER TABLE newstudent CHANGE age stud_age INT;

-- ALTER TABLE newstudent MODIFY age VARCHAR(2);
-- UPDATE newstudent SET age = 19;

-- TRUNCATE TABLE newstudent;

-- ALTER TABLE newstudent CHANGE name full_Name VARCHAR(50);

-- DELETE FROM newStudent WHERE marks < 80;
-- ALTER TABLE newStudent DROP COLUMN grade;


-- SELECT * FROM newstudent;