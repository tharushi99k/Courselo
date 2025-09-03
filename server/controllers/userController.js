import Stripe from 'stripe';
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js'
import { CourseProgress } from '../models/CourseProgress.js';
//get user data
export const getUserData = async (req, res)=>{
    try{
        const userId = req.auth.userId;
        // const user = await User.findById(userId)
        const user = await User.findOne({ _id: userId });

        if(!user){
            return res.json({success:false, message:'User Not Found'})
        }
        res.json({success:true, user})
    }catch (error){
        res.json({success:false, message:error.message})

    }
}

//users enrolled courses with lecture links
export const userEnrolledcourses = async (req, res)=>{
    try{
        const userId = req.auth.userId
        const userData = await User.findById(userId).populate('enrolledCourses')

        res.json({success:true, enrolledCourses: userData.enrolledCourses })

    }catch (error){
        res.json({success:false, message:error.message})

    }
}

//Purchase course
export const purchaseCourse = async (req, res)=>{
    try{
        const {courseId} = req.body
        const {origin} = req.headers
        const userId = req.auth.userId
        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)

        if(!userData || !courseData){
            return res.json({ success: false, message: 'Data Not Fount'})
        }
        const purchaseDate = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
        }
        const newPurchase = await Purchase.create(purchaseDate)

        //Stripe gateway Initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

        const currency = process.env.CURRENCY.toLowerCase()

        //Creating line items to for stripe
        const line_items = [{
            price_data:{
                currency,
                product_data:{
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(newPurchase.amount) * 100
            },
            quantity: 1
        }]
        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })
        res.json({success:true, session_url: session.url})

    }catch (error){
        res.json({sucess:false, message:error.message});

    }
}

//update user course progress
export const updateUserCourseProgress = async (req, res)=>{
    try{
        const userId = req.auth.userId
        const {courseId, lectureId}= req.body
        const progressData = await CourseProgress.findOne({userId, courseId })

        if(progressData){
            if(progressData.lectureCompleted.includes(lectureId)){
                return res.json({success:true, message: 'Lecture Already Completed'})
            }
            progressData.lectureCompleted.push(lectureId)
            await progressData.save()
        }else{
            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            })
        }
        res.json({success:true, message: 'Progress Update'})

    }catch(error){
        res.json({success: false, message: error.message})

    }
}

//get user course progress
export const getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const purchases = await Purchase.find({ userId, status: 'Pending' });
    
    const enrolledCourses = await Promise.all(
      purchases.map(async (p) => {
        const course = await Course.findById(p.courseId);
        return course; // return full course object
      })
    );

    res.json({ success: true, enrolledCourses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// export const getUserCourseProgress =async (req, res) =>{
//     try{
//          const userId = req.auth.userId
//         const {courseId}= req.body
//         const progressData = await CourseProgress.findOne({userId, courseId })
//         res.json({success: true, progressData})

//     }catch(error){

//     }
// }

//Add User Ratings to vourse

export const addUserRating = async (req,res)=>{
    const userId = req.auth.userId;
    const {courseId, rating}= req.body;

    if(!courseId || !userId || !rating || rating<1 || rating>5){
        return res.json({ success:false,message: 'Invalid Details'});
    }

    try{
        const course = await Course.findById(courseId);

        if(!course){
            return res.json({success:false, message: 'Course not found'});
        }

        const user = await User.findById(userId);

        if(!user || !user.enrolledCourses.includes(courseId)){
            return res.json({success:false,message: 'User has not purchased this course'});
        }

        const exixtingRatingIndex = course.courseRatings.findIndex(r =>r.userId === userId)

        if(exixtingRatingIndex > -1){
            course.courseRatings[exixtingRatingIndex].rating = rating;
        }await course.save();

        return res.json({success:true, message:'Rating added'})

    }catch (error){
        return res.json({success:false,message:error.message});

    }
}
