import {body,validationResult} from "express-validator"
const handleValidationErrors=async(req,res,next)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    next();
}
const validateMyUser=[
    body("name").isString().notEmpty().withMessage("Name is a string"),
    body("address").isString().notEmpty().withMessage("Address is a string"),
     body("city").isString().notEmpty().withMessage("City is a string"),
      body("country").isString().notEmpty().withMessage("Country is a string"),
      handleValidationErrors
]
export {validateMyUser}