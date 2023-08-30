import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumni',
    required: true
  },
  content: {
    type: {
      text: {
        type: String
      },
      imageUrl: {
        type: String
      }
    },
    required: true
  },
  // Access for communitytype2: admin, alumni
  // Access for communitytype1: admin, alumni, student
  access: {
    type: String,
    enum: ['communitytype1', 'communitytype2'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Post = mongoose.model('Post', postSchema);

export default Post;
