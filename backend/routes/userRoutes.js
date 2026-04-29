const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);

router.post('/update-location', userController.updateLocation);
router.get('/map-data/:teacherId', userController.getMapData);
router.get('/my-students/:teacherId', userController.getStudents);

router.get('/:id', userController.getUserByid);
router.get('/', userController.getAllUsers);

module.exports = router;