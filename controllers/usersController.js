const User=require('../Models/User');
const Note=require('../Models/Note');
const asyncHandler=require('express-async-handler');
const bcrypt=require('bcrypt');
const { getDefaultOptions } = require('date-fns');

// this is for the get method

const getAllUsers=asyncHandler(async(req,res)=>{
const users=await User.find().select('-password').lean()
if(!users?.length){
  return res.status(404).json({message:'No users found'})
}
  res.json(users)

})

// this is for the post method

const createNewUsers=asyncHandler(async(req,res)=>{
  const {username,password,roles}=req.body;
  if(!username || !password){
    return res.status(400).json({message:'All fields are required'})
  }
  const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()  
  
if(duplicate){
  return res.status(409).json({message:"Duplicate username"})
}

const hashedPWD=await bcrypt.hash(password,10)

const userObject = (!Array.isArray(roles) || !roles.length)
        ? { username, "password": hashedPWD }
        : { username, "password": hashedPWD, roles }

const user=await User.create(userObject)

if(user){
  res.status(209).json({message:`New user ${username} created`})
}
else{
  res.status(400).json({message:'Invalid user data received'})
}
})

// this is for the patch or update method

const updateUser=asyncHandler(async(req,res)=>{
const {id,username,roles,active,password}=req.body
if(!id||!username||!Array.isArray(roles)||!roles.length||typeof active!=='boolean'){
  return res.status(400).json({message:"All the fields are required"})
}
const user=await User.findById(id).exec()
if(!user){
  return res.status(400).json({message:"User not found"})
}
const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

if(duplicate&&duplicate?._id.toString(id)!==id){
  return res.status(409).json({message:"duplicate username"})
}
user.username=username;
user.roles=roles;
user.active=active;
if(password){
  user.password=await bcrypt.hash(password,10)
}
const updateUser=await user.save();
res.json({message:`User ${updateUser.username} updated`})
})

// this is for the delete method

const deleteUser=asyncHandler(async(req,res)=>{
const {id}=req.body
if(!id){
  return res.status(400).json({message:"user id required"})
}
const note=await Note.findOne({user:id}).lean().exec()

if(note){
  return res.status(400).json({message:"Notes has already been written"})
}
const user=await User.findById(id).exec()
if(!user){
  return res.status(400).json({messgae:"User not found"})
}
const result=await user.deleteOne()
const reply=`Username ${result.username} with ID ${result._id} deleted`
res.json(reply)
})

module.exports={
  getAllUsers,
  createNewUsers,
  updateUser,
  deleteUser
}
