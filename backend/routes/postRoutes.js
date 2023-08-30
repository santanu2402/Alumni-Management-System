import express from 'express';
import multer from 'multer';
import cloudinary from 'cloudinary';
import cors from 'cors';

import Post from '../mongodb/models/alumni/postModel.js';
import fetchuserMiddleware from '../middleware/fetchUser.js';

const router = express.Router();
router.use(cors());

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for post image upload
const upload = multer({ dest: 'uploads/' });

// Create Post API
router.post('/createpost', upload.single('postImage'), async (req, res) => {
    try {
        const { alumniId, text, access } = req.body;
        console.log(req.body)
        let imageUrl = '';
        if (req.file) {
            const imageResult = await cloudinary.v2.uploader.upload(req.file.path);
            imageUrl = imageResult.secure_url;
        }

        const content = {
            text,
            imageUrl
        };

        const newPost = new Post({
            alumni: alumniId,
            content,
            access
        });

        await newPost.save();
        console.log(newPost)
        res.status(201).json({ success: true, message: 'Post created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Fetch All Posts API
router.get('/getposts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Fetch Posts for Community Type 1 (alumni and student)
router.get('/getposts/communitytype1', async (req, res) => {
    try {
        const posts = await Post.find({ access: 'communitytype1' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Fetch Posts for Community Type 2 (alumni)
router.get('/getposts/communitytype2', async (req, res) => {
    try {
        const posts = await Post.find({ access: 'communitytype2' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Fetch Posts for Both Community Types (alumni and student)
router.get('/getposts/bothcommunitytypes', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        console.log(posts)
        res.status(200).json({ success: true, posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Delete Post API
router.delete('/deletepost/:postId', fetchuserMiddleware, async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        console.log('Found post:', post);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        if (post.alumni.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'You do not have permission to delete this post' });
        }
        const deletedPost = await Post.findByIdAndRemove(postId);
        if (!deletedPost) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Fetch Alumni's Posts API
router.get('/yours/getposts', fetchuserMiddleware, async (req, res) => {
    try {
        // Fetch posts of the logged-in alumni based on their ID
        const posts = await Post.find({ alumni: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

export default router;



// alternate fetching
// Fetch Posts by Access Level API
// router.get('/getposts/:access', async (req, res) => {
//     try {
//         const { access } = req.params;

//         let posts;
//         if (access === 'both') {
//             // Fetch posts for both communitytype1 and communitytype2
//             posts = await Post.find().sort({ createdAt: -1 });
//         } else {
//             // Fetch posts based on specific access level
//             posts = await Post.find({ access }).sort({ createdAt: -1 });
//         }

//         res.status(200).json({ success: true, posts });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// });

// export default router;
