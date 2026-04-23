const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
router.post('/register', userController.register);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserByid);
router.get('/my-students/:teacherid', userController.getStudents);
router.post('/login', userController.login);
module.exports = router;
