import express from 'express'
import { getAllcourse, getcourseId } from '../controllers/courseController.js'

const courseRouter = express.Router()

courseRouter.get('/all',getAllcourse)
courseRouter.get('/:id',getcourseId)

export default courseRouter;