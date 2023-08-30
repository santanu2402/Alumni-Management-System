import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import cloudinary from 'cloudinary';
import multer from 'multer';
import cors from 'cors';

import Alumni from '../mongodb/models/alumni/alumniModel.js';
import AllStudent from '../mongodb/models/allstudent/allstudentModel.js';
import Post from '../mongodb/models/alumni/postModel.js';
import Training from '../mongodb/models/alumni/trainingPostModel.js';
import fetchuserMiddleware from '../middleware/fetchUser.js'; // Import the middleware
import dotenv from 'dotenv';

const router = express.Router();
router.use(cors());
dotenv.config();
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for profile photo upload
const upload = multer({ dest: 'uploads/' }); // Adjust the destination folder as needed

// Create Alumni API
router.post('/create', [
  upload.single('profilePhoto'),
  body('alumniData.username', 'Username cannot be blank').trim().notEmpty(),
  body('alumniData.password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
  body('alumniData.workingStatus', 'Working status cannot be blank').trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { alumniData } = req.body;
    // Check if the username is already taken
    const existingAlumni = await Alumni.findOne({ username: alumniData.username });
    if (existingAlumni) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Find the corresponding student data for the alumni
    // Upload profile photo to Cloudinary
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    const { username, password, workingStatus, organization, role, previousCompany, skills, industrialExperience, studentId } = JSON.parse(alumniData);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("after")

    const newAlumni = new Alumni({
      username: username,
      password: hashedPassword,
      profilePhotoUrl: result.secure_url,
      workingStatus: workingStatus,
      organization: organization,
      role: role,
      previousCompany: previousCompany,
      skills: skills,
      industrialExperience: industrialExperience,
      student: studentId
      // Reference to the student data
    });
    // Save the new alumni to the database
    console.log(newAlumni)
    console.log(newAlumni.student)
    await newAlumni.save();
    res.status(201).json({ success: true, message: 'Alumni created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Login API
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
    let alumni = await Alumni.findOne({ username });
    if (!alumni) {
      return res.status(400).json({ success: false, error: 'Enter correct login credentials' });
    }

    const passwordComp = await bcrypt.compare(password, alumni.password);
    if (!passwordComp) {
      return res.status(400).json({ success: false, error: 'Enter correct login details' });
    }

    const data = {
      info: {
        id: alumni._id
      }
    };

    const authToken = jwt.sign(data, process.env.JWT_SECRET);

    res.json({ success: true, authToken });

  } catch (err) {
    console.log(err.message);
    res.status(500).send('Internal Server Error');
  }
});

// Fetch User Details API
router.post('/getuser', fetchuserMiddleware, async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.user.id).select('-password').populate('student');
    res.send(alumni);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Update Alumni Details API
router.put('/update', fetchuserMiddleware, [
  body('username', 'Username cannot be blank').trim().notEmpty(),
  body('workingStatus', 'Working status cannot be blank').trim().notEmpty(),
  body('organization', 'Organization cannot be blank').trim().notEmpty(),
  body('role', 'Role cannot be blank').trim().notEmpty(),
  body('previousCompany', 'Previous company cannot be blank').trim().notEmpty(),
  body('skills', 'Skills must be an array').isArray(),
  body('skills.*', 'Skill must be a non-empty string').trim().notEmpty(),
  body('industrialExperience', 'Industrial experience cannot be blank').trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    console.log(errors)
    console.log(req.body)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, workingStatus, organization, role, previousCompany, skills, industrialExperience } = req.body;
    console.log(req.body)
    // Find the alumni based on the authenticated user
    const alumni = await Alumni.findById(req.user.id);

    if (!alumni) {
      return res.status(404).json({ success: false, message: 'Alumni not found' });
    }

    // Update alumni details
    alumni.username = username;
    alumni.workingStatus = workingStatus;
    alumni.organization = organization;
    alumni.role = role;
    alumni.previousCompany = previousCompany;
    alumni.skills = skills;
    alumni.industrialExperience = industrialExperience;

    // Save the updated alumni details
    await alumni.save();

    res.status(200).json({ success: true, message: 'Alumni details updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Search Alumni API
router.get('/search', fetchuserMiddleware, async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
          { organization: { $regex: req.query.search, $options: 'i' } },
          { role: { $regex: req.query.search, $options: 'i' } },
        ],
      }
      : {};

    const alumniList = await Alumni.find(keyword).find({ _id: { $ne: req.user._id } }).populate('student');
    res.status(200).json({ success: true, alumniList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Delete Alumni API
router.delete('/delete', fetchuserMiddleware, async (req, res) => {
  try {
    // Find the alumni based on the authenticated user
    await Alumni.findByIdAndRemove(req.user.id);
    await Post.deleteMany({ alumni: req.user.id })
    await Training.deleteMany({ alumni: req.user.id })

    res.status(200).json({ success: true, message: 'Alumni user deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;

