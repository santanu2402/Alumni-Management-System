import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import cors from 'cors';

import Admin from '../mongodb/models/admin/adminModel.js'
import AllStudent from '../mongodb/models/allstudent/allstudentModel.js';
import Student from '../mongodb/models/student/studentModel.js';
import Alumni from '../mongodb/models/alumni/alumniModel.js';
import fetchuserMiddleware from '../middleware/fetchUser.js';

const router = express.Router();
router.use(cors());

// Create Admin API
router.post('/create', [
    body('username', 'Username cannot be blank').trim().notEmpty(),
    body('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { username, password } = req.body;

        // Check if the username is already taken
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        // Encrypt the password using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new Admin based on the Admin model and provided data
        const newAdmin = new Admin({
            username,
            password: hashedPassword,
        });

        // Save the new Admin to the database
        await newAdmin.save();

        res.status(201).json({ success: true, message: 'Admin created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Login API for Admin
router.post('/login', [
    body('username', 'Enter a valid username').exists(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { username, password } = req.body;

        let admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).json({ success: false, error: 'Enter correct login credentials' });
        }

        const passwordComp = await bcrypt.compare(password, admin.password);
        if (!passwordComp) {
            return res.status(400).json({ success: false, error: 'Enter correct login details' });
        }

        const data = {
            info: {
                id: admin._id
            }
        };

        const authToken = jwt.sign(data, process.env.JWT_SECRET);

        res.json({ success: true, authToken });

    } catch (err) {
        console.log(err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Fetch User Details API for Admin
router.post('/getuser', fetchuserMiddleware, async (req, res) => {
    try {
        console.log(req.user.id);
        const admin = await Admin.findById(req.user.id).select('-password');
        res.send(admin);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Add New main Student Data API
router.post('/addstudent', fetchuserMiddleware, [
    body('name', 'Name cannot be empty').notEmpty(),
    body('rollno', 'Rollno cannot be empty').notEmpty(),
    body('dateOfBirth', 'Date of Birth cannot be empty').notEmpty(),
    body('gender', 'Gender cannot be blank').exists(),
    body('phoneNumber', 'Phone number cannot be empty').notEmpty(),
    body('phoneNumber', 'Phone number limit is 10').isLength({ min: 10 }),
    body('phoneNumber', 'Phone number limit is 10').isLength({ max: 10 }),
    body('email', 'Email cannot be blank').exists(),
    body('email', 'Enter a valid email').isEmail(),
    body('degree', 'Degree cannot be empty').notEmpty(),
    body('course', 'Course cannot be empty').notEmpty(),
    body('courseStartDate', 'Course Start Date cannot be empty').notEmpty(),
    body('courseEndDate', 'Course End Date cannot be empty').notEmpty(),
    body('passout', 'Passout status cannot be blank').exists(),
    body('passout', 'Passout status can only be yes or no').isIn(['yes', 'no']),
], async (req, res) => {
    try {
        // Verify that the authenticated user is an admin
        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Validate input data
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        // Extract data from request body
        const {
            name,
            rollno,
            dateOfBirth,
            gender,
            phoneNumber,
            email,
            degree,
            course,
            courseStartDate,
            courseEndDate,
            passout
        } = req.body;

        // Create a new student based on the AllStudent model and provided data
        const newStudent = new AllStudent({
            name,
            rollno,
            dateOfBirth,
            gender,
            phoneNumber,
            email,
            degree,
            course,
            courseStartDate,
            courseEndDate,
            passout
        });

        // Save the new student data to the database
        await newStudent.save();

        res.status(201).json({ success: true, message: 'Student data added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// View All Student Data API
router.get('/viewallstudents', fetchuserMiddleware, async (req, res) => {
    try {
        // Verify that the authenticated user is an admin
        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Fetch all data from AllStudent table
        const allStudentData = await AllStudent.find();

        res.status(200).json({ success: true, allStudentData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// View Student Data API
router.get('/viewstudents', fetchuserMiddleware, async (req, res) => {
    try {
        // Verify that the authenticated user is an admin
        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Fetch all data from Student table
        const studentData = await Student.find().populate('student');

        res.status(200).json({ success: true, studentData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// View Alumni Data API
router.get('/viewalumni', fetchuserMiddleware, async (req, res) => {
    try {
        // Verify that the authenticated user is an admin
        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Fetch all data from Alumni table
        const alumniData = await Alumni.find().populate('student');

        res.status(200).json({ success: true, alumniData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Delete Document from AllStudent Table API
router.delete('/deleteallstudent', fetchuserMiddleware, async (req, res) => {
    try {
        // Verify that the authenticated user is an admin
        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { rollno, email } = req.query;

        // Delete student data from AllStudent table
        await AllStudent.findOneAndDelete({ rollno, email });

        res.status(200).json({ success: true, message: 'Student data deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Delete Document from Student Table API
router.delete('/deletestudent', fetchuserMiddleware, async (req, res) => {
    try {
        // Verify that the authenticated user is an admin
        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { username } = req.query;

        // Delete student user from Student table
        await Student.findOneAndDelete({ username });

        res.status(200).json({ success: true, message: 'Student user deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Delete Document from Alumni Table API
router.delete('/deletealumni', fetchuserMiddleware, async (req, res) => {
    try {
        // Verify that the authenticated user is an admin
        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { username } = req.query;

        // Delete alumni data from Alumni table
        await Alumni.findOneAndDelete({ username });

        res.status(200).json({ success: true, message: 'Alumni data deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


export default router;
