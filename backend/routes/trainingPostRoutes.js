import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import cors from 'cors';

import Training from '../mongodb/models/alumni/trainingPostModel.js';
import fetchuserMiddleware from '../middleware/fetchUser.js';
import dotenv from 'dotenv';

const router = express.Router();
router.use(cors());
dotenv.config();
// Create Training Post API
router.post('/create', [
    body('trainingType', 'Invalid training type').isIn(['private', 'public']),
    body('topic', 'Topic cannot be blank').trim().notEmpty(),
    body('details', 'Details can be provided').optional().notEmpty(),
    body('targetAudience', 'Target audience can be provided').optional().notEmpty(),
    body('place', 'Place can be provided').optional().notEmpty(),
    body('isRemote', 'isRemote must be a boolean').optional().isBoolean(),
    body('meetingLink', 'Meeting link can be provided').if(body('isRemote').equals(true)).notEmpty(),
    body('audienceLimit.enabled', 'audienceLimit.enabled must be a boolean').optional().isBoolean(),
    body('audienceLimit.limit', 'audienceLimit.limit must be a number').optional().isNumeric(),
    body('dateTime', 'Date and time must be a valid date').notEmpty(),
], fetchuserMiddleware, async (req, res) => {
    try {
        console.log(req.body)
        const errors = validationResult(req);
        console.log(errors)
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }


        console.log(req.body)
        console.log(req.user.id)

        const alumni = req.user.id;
        const {
            trainingType,
            topic,
            details,
            targetAudience,
            place,
            isRemote,
            meetingLink,
            audienceLimit,
            dateTime
        } = req.body;

        const parsedDateTime = new Date(dateTime);
        const newTraining = new Training({
            alumni,
            trainingType,
            topic,
            details,
            targetAudience,
            place,
            isRemote,
            meetingLink,
            audienceLimit,
            dateTime: parsedDateTime,
        });

        await newTraining.save();

        res.status(201).json({ success: true, message: 'Training post created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Fetch All Training Posts API
router.get('/getposts', async (req, res) => {
    try {
        const trainingPosts = await Training.find().sort({ createdAt: -1 }).populate('alumni');
        res.status(200).json({ success: true, trainingPosts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Fetch Training Posts by Training Type API
router.get('/gettrainingposts/:trainingType', async (req, res) => {
    try {
        const { trainingType } = req.params;
        const trainingPosts = await Training.find({ trainingType }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, trainingPosts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Delete Training Post API
router.delete('/delete/:postId', fetchuserMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;

        await Training.findByIdAndRemove(postId);


        res.status(200).json({ success: true, message: 'Training post deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Fetch Training Posts for Current Alumni API
router.get('/yours/gettrainingposts/', fetchuserMiddleware, async (req, res) => {
    try {
        console.log(req.user.id)
        const trainingPosts = await Training.find({ alumni: req.user.id }).sort({ createdAt: -1 });
        console.log(trainingPosts)
        res.status(200).json({ success: true, trainingPosts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

export default router;
