import { Webhook } from "svix";
import User from "../models/User.js";

//api controller function to manage clerk user with database
export const clerkWebhooks = async (req, res)=>{
    try{
        const whook = new Webhook (process.env.CLERK_WEBHOOK_SECRET)

        await whook.verify(JSON.stringify( req.body),{
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        })

        const {data, type} = req.body

        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " "+ data.last_name,
                    imageurl: data.image_url,
                }
                await User.create(userData)
                res.json({})
                break;
            }

            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name:data.first_name + " "+ data.last_name,
                    imageUrl: data.image_url,
                }
                await User.findByIdAndUpdate(data.id, userData)
                res.json({})
                break;
            }
            case 'user.deleted': {
                await User.findByIdAndDelete(data.id)
                res.json({})
                break;    
                
            }
                
            default:
                break;
        }

    } catch (error) {
        res.json({success: false, message:error.message})

    }
}

// import { Webhook } from "svix";
// import User from "../models/User.js";

// // API controller function to manage Clerk users with database
// export const clerkWebhooks = async (req, res) => {
//     try {
//         const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

//         // Verify webhook signature
//         await whook.verify(JSON.stringify(req.body), {
//             "svix-id": req.headers["svix-id"],
//             "svix-timestamp": req.headers["svix-timestamp"],
//             "svix-signature": req.headers["svix-signature"]
//         });

//         const { data, type } = req.body;

//         console.log("Webhook received:", type, data); // debug log

//         switch (type) {
//             case 'user.created': {
//                 const userData = {
//                     _id: data.id,
//                     email: data.email_addresses[0].email_address,
//                     name: data.first_name + " " + data.last_name,
//                     imageurl: data.image_url, // matches schema
//                 };
//                 console.log("Creating user:", userData);
//                 await User.create(userData);
//                 res.status(200).json({ received: true });
//                 break;
//             }

//             case 'user.updated': {
//                 const userData = {
//                     email: data.email_addresses[0].email_address,
//                     name: data.first_name + " " + data.last_name,
//                     imageurl: data.image_url, // match schema
//                 };
//                 console.log("Updating user:", userData);
//                 await User.findByIdAndUpdate(data.id, userData);
//                 res.status(200).json({ received: true });
//                 break;
//             }

//             case 'user.deleted': {
//                 console.log("Deleting user:", data.id);
//                 await User.findByIdAndDelete(data.id);
//                 res.status(200).json({ received: true });
//                 break;
//             }

//             default:
//                 console.log("Unknown event type:", type);
//                 res.status(200).json({ received: true });
//                 break;
//         }

//     } catch (error) {
//         console.error("Webhook error:", error.message);
//         res.status(400).json({ success: false, message: error.message });
//     }
// };
