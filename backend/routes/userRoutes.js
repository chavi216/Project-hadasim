import express from 'express';
import * as userController from '../controllers/userController.js';
const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);

router.post('/update-location', userController.updateLocation);
router.get('/map-data/:teacherId',userController.verifyTeacher, userController.getMapData);
router.get('/my-students/:teacherId',userController.verifyTeacher, userController.getStudents);

router.get('/:id',userController.verifyTeacher, userController.getUserByid);
router.get('/', userController.verifyTeacher, userController.getAllUsers);

export default router;