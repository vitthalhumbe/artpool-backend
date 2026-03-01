const express = require('express');
const router = express.Router();
const {createBlog, getBlogsByUser } = require('../controllers/blogController');

router.post('/', createBlog);
router.get('/user/:userId', getBlogsByUser);

module.exports = router;