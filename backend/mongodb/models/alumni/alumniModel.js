import mongoose from 'mongoose';

const alumniSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profilePhotoUrl: {
    type: String
  },
  workingStatus: {
    type: String
  },
  organization: {
    type: String
  },
  role: {
    type: String
  },
  previousCompany: {
    type: String
  },
  skills: {
    type: [String]
  },
  industrialExperience: {
    type: String
  },
  // Reference to allStudentModel
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AllStudent'
  }
});

const Alumni = mongoose.model('Alumni', alumniSchema);

export default Alumni;
