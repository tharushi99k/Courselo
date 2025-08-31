import express from 'express'
import { getUserData, purchaseCourse, userEnrolledcourses } from '../controllers/userController.js'


const userRouter = express.Router()

userRouter.get('/data',getUserData)
userRouter.get('/enrolled-courses',userEnrolledcourses)
userRouter.post('/purchase',purchaseCourse)

export default userRouter;