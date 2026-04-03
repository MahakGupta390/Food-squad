import {Router} from "express"
import { createCurrentUser } from "../controllers/user.controllers.js"
import { updateUser } from "../controllers/user.controllers.js"
import  {validateMyUser} from "../middleware/validation.js"
import {getUser} from "../controllers/user.controllers.js"

import { jwtCheck } from "../middleware/auth.js"

const router=Router()
router.get("/",getUser)
router.post("/",createCurrentUser)
router.patch("/update",updateUser)
export default router