const express = require('express');
const cors = require('cors');
const path = require('path'); 
const userRoutes = require('./routes/userRoutes'); 

const app = express();
app.use(express.json()); 
app.use(cors()); 
app.use('/api/users', userRoutes);
require('./controllers/simalation');

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});