import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import cors from 'cors';

import Student from '../mongodb/models/student/studentModel.js';
import AllStudent from '../mongodb/models/allstudent/allstudentModel.js';
import fetchuserMiddleware from '../middleware/fetchUser.js';

const router = express.Router();
router.use(cors());

// Create Student API
router.post('/create', [
    body('username', 'Username cannot be blank').trim().notEmpty(),
    body('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { username, password, studentid } = req.body;

        // Check if the username is already taken
        const existingStudent = await Student.findOne({ username });
        if (existingStudent) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        // Find the corresponding student data for the student
        const studentData = await AllStudent.findById(studentid);

        if (!studentData) {
            return res.status(400).json({ success: false, message: 'Student data not found' });
        }

        // Encrypt the password using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new student based on the student model and provided data
        const newStudent = new Student({
            username,
            password: hashedPassword,
            student: studentData._id // Reference to the student data
        });

        // Save the new student to the database
        await newStudent.save();

        res.status(201).json({ success: true, message: 'Student created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Login API for Student
router.post('/login', [
    body('username', 'Enter a valid username').exists(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        let student = await Student.findOne({ username });
        if (!student) {
            return res.status(400).json({ success: false, error: 'Enter correct login credentials' });
        }

        const passwordComp = await bcrypt.compare(password, student.password);
        if (!passwordComp) {
            return res.status(400).json({ success: false, error: 'Enter correct login details' });
        }

        const data = {
            info: {
                id: student._id
            }
        };

        const authToken = jwt.sign(data, process.env.JWT_SECRET);

        res.json({ success: true, authToken });

    } catch (err) {
        console.log(err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Fetch User Details API for Student
router.post('/getuser', fetchuserMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).select('-password').populate('student');
        res.send(student);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Update Student Details API
router.put('/update', fetchuserMiddleware, async (req, res) => {
    try {
        const { username } = req.body;

        // Find the student based on the authenticated user
        const student = await Student.findById(req.user.id);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Update the username if provided
        if (username) {
            student.username = username;
        }

        // Save the updated student details
        await student.save();

        res.status(200).json({ success: true, message: 'Student details updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Delete Student API
router.delete('/delete', fetchuserMiddleware, async (req, res) => {
    try {
        await Student.findByIdAndRemove(req.user.id);

        res.status(200).json({ success: true, message: 'Student user deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Search Student API
router.get('/searchstudent', fetchuserMiddleware, async (req, res) => {
    try {
        const keyword = req.query.search
            ? {
                $or: [
                    { name: { $regex: req.query.search, $options: 'i' } },
                    { rollno: { $regex: req.query.search, $options: 'i' } },
                    { email: { $regex: req.query.search, $options: 'i' } },
                ],
            }
            : {};

        const studentList = await AllStudent.find(keyword);
        res.status(200).json({ success: true, studentList });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
export default router;
