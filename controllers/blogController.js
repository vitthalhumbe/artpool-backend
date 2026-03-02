const Blogs = require('../models/Blogs');


const createBlog = async (req, res) => {
    try {
        const {title, coverImage, content, artist} = req.body;
        const blog = await Blogs.create({title, coverImage, content, artist});
        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

const getBlogsByUser = async (req, res) => {
  try {
    const blogs = await Blogs.find({ artist: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {createBlog, getBlogsByUser};