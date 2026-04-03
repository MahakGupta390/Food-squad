import { User } from "../models/user.models.js"



const createCurrentUser=async(req,res)=>{
    //1. check if user exists
    //2. if not create a new user
    //3. return the user
    try{
        const {auth0id}= req.body
        const existingUser= await User.findOne({auth0id})
        if(existingUser){
           return res.status(200).send();
        }
        const newUser=new User(req.body)
        await newUser.save()
        res.status(201).json(newUser.toObject())
    }
    catch(error){
        console.log(error)
        res.status(500).json({message:"Error creating user"})
    }
}

const updateUser=async(req,res)=>{
    try{
        const {auth0id,name,address,city,country}=req.body;
        const user=await User.findOne({auth0id})
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        user.name=name;
        user.address=address;
        user.city=city;
        user.country=country;
        await user.save()
        res.status(200).json(user); 

    }catch(error){
         console.log(error)
        res.status(500).json({message:"Error updating user"})
    }

}
const getUser=async(req,res)=>{
    try{
        const auth0id="65f1a2b3c4d5e6f7a8b9c0d1"
        const currentUser=await User.findOne({auth0id})
        if(!currentUser){
            return res.status(404).json({message:"User not found"})
        }
        res.json(currentUser)


    }catch(error){
        console.log(error)
        res.status(500).json({message:"Something went wrong"})

    }

}
export {createCurrentUser,updateUser,getUser};