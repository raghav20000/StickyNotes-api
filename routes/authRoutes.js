const express=require("express")
const router=express.Router()
const authCollection=require("../controllers/authController")
const loginLimiter=require("../middleware/loginLimiter")

router.route("/")
    .post(loginLimiter,authCollection.login)

router.route("/refresh")
      .get(authCollection.refresh)

router.route("/logout")
    .post(authCollection.logout)

module.exports=router