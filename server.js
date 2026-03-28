require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');



const authRoutes = require('./routes/authRoutes');
const artworkRoutes = require('./routes/artworkRoutes')
const blogRoutes = require('./routes/blogRoutes');

const app = express();

app.use(express.json()); 
app.use(cors()); 

app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/blogs/', blogRoutes);
app.use('/api/commissions', require('./routes/commissionRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`mongo conntected : ${conn.connection.host}`);
        console.log(`Connected to Cluster: Bhavani`); 
    } catch (error) {
        console.error(`errror: ${error.message}`);
        process.exit(1); 
    }
};

app.get('/', (req, res) => {
    res.send('api running');
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server runs at :  ${PORT}`);
    });
});