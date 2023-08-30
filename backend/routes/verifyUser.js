import express from 'express';
import { body, validationResult } from 'express-validator';
import AllStudent from '../mongodb/models/allstudent/allstudentModel.js'
import cors from 'cors';

const router = express.Router();
router.use(cors());

router.post('/', [
    body('name', 'Name cannot be blank').exists(),
    body('rollno', 'RollNo cannot be blank').exists(),
    body('gender', 'Gender cannot be blank').exists(),
    body('email', 'Email cannot be blank').exists(),
    body('email', 'Enter a valid email').isEmail(),
    body('passout', 'passout cannot be blank').exists(),
    body('passout', 'passout can only be yes or no').isIn(['yes', 'no']),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, rollno, gender, email, passout } = req.body;
        const alumni = await AllStudent.findOne({
            name,
            rollno,
            gender,
            email,
            passout
        });

        if (alumni) {
            res.status(200).json({ success: true, message: 'verified', alumni: alumni });
            console.log(alumni);
        } else {
            res.status(500).json({ success: false, message: 'Not verified' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
})

export default router;