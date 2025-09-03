import express from 'express'
import { addcourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateRoleToEducator } from "../controllers/educatorController.js"
import { protectEducator } from '../middlewares/authmiddleware.js'
import upload from '../configs/multer.js'



const educatorRouter = express.Router()

//add educator role

educatorRouter.get('/update-role', updateRoleToEducator)
educatorRouter.post('/add-course', upload.single('image'),protectEducator,addcourse)
educatorRouter.get('/courses', protectEducator, getEducatorCourses)
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData)
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData)


export default educatorRouter;

// http://localhost:5000/api/educator/add-course
// http://localhost:5000/api/educator/course