import mongoose from 'mongoose';

const allStudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  rollno: {
    type: String,
    required: true,
    unique: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  degree: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  courseStartDate: {
    type: Date,
    required: true
  },
  courseEndDate: {
    type: Date,
    required: true
  },
  passout: {
    type: String,
    enum: ['yes', 'no'],
    required: true
  }
});

const AllStudent = mongoose.model('AllStudent', allStudentSchema);

export default AllStudent;
