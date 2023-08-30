import mongoose from 'mongoose';

const trainingSchema = new mongoose.Schema({
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumni',
    required: true
  },
  trainingType: {
    type: String,
    enum: ['private', 'public'],
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  targetAudience: {
    type: String
  },
  place: {
    type: String
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  meetingLink: {
    type: String
  },
  audienceLimit: {
    enabled: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number
    }
  },
  dateTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Training = mongoose.model('Training', trainingSchema);

export default Training;
