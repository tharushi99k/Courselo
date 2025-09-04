
import mongoose from 'mongoose';

const courseProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
  completed: { type: Boolean, default: false },
  lectureCompleted: [{ type: String }] 
}, { minimize: false });

export const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema);
