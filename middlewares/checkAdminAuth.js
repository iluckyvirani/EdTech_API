import jwt from 'jsonwebtoken'
import AdminModel from '../models/AdminModel.js'

var checkUserAuth = async (req, res, next) => {
  let token
  const { authorization } = req.headers
  if (authorization && authorization.startsWith('Bearer')) {
    try {
      // Get Token from header
      token = authorization.split(' ')[1]

      // Verify Token
      const { adminId } = jwt.verify(token, process.env.JWT_SECRET)

      // Get User from Token
     const admin = req.admin = await AdminModel.findById(adminId);

      next()
    } catch (error) {
      console.log(error)
      res.status(401).send({ "status": "failed", "message": "Unauthorized Admin" })
    }
  }
  if (!token) {
    res.status(401).send({ "status": "failed", "message": "Unauthorized Admin, No Token" })
  }
}

export default checkUserAuth