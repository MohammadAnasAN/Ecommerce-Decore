const express = require('express');
require('dotenv').config();
const path = require('path');
const bcryptjs = require('bcryptjs');
const session = require('express-session'); // Import express-session

const collection = require('./config/dbConnect.js');
const userRoute = require('./router/user.js');
const adminRouter = require('./router/admin.js');
const morgan = require('morgan');
const app = express();

const port = process.env.PORT

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// Set up session middleware
app.use(
  session({
    secret: 'your-secret-key', // Change this to a secure secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Change this to true if your app is served over HTTPS
  })
);

app.use('/', userRoute);
app.use('/', adminRouter);



app.set('view engine', 'ejs');
app.set('views', ['./views/user', './views/admin']);

app.use(express.static(path.join(__dirname, 'public')));
app.get("*",(req,res)=>{
  res.render("error")
})

app.listen(port, () => {
  console.log(`Server starting on port ${port}`);
});
