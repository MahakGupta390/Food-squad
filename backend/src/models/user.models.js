import mongoose from "mongoose"
const userSchema=new mongoose.Schema({
    auth0id:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    name:{
        type:String,
    },
    address:{
        type:String,
    },
    city:{
        type:String,
    },
    country:{
        type:String
    },
},{
    timestamps:true,
})
export const User=mongoose.model("User",userSchema)
