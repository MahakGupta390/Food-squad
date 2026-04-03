import {Router} from "express"
import {createSplit,getSplit,payFull,payUser} from "../controllers/split.controllers.js"
const splitRoutes=Router()
splitRoutes.post("/create/:orderId",createSplit)
splitRoutes.get("/:orderId",getSplit)
splitRoutes.post("/pay_full/:orderId",payFull)
splitRoutes.post("/pay_user/:orderId/:userId",payUser)
export default splitRoutes
