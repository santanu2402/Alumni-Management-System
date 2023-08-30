import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // Reference to allStudentModel
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AllStudent',
    required: true
  }
});

const Student = mongoose.model('Student', studentSchema);

export default Student;