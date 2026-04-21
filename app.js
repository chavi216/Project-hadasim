const express = require('express');
const cors = require('cors');
const userRoutes = require('./Src/Routes/userRoutes'); // ודאי שהאותיות הגדולות בנתיב נכונות!

const app = express();

app.use(express.json()); 
app.use(cors());         


app.use('/api/users', userRoutes);


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log("Waiting for requests...");
});