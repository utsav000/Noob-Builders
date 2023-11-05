if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require("express");
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');  //for templeting of partials
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');
const Complaint = require('./models/complaint');
mongoose.set('strictQuery', false);
const { isLoggedIn, validateCampground } = require('./middleware');

// ------------------save from exploits---

const mongoSanitize = require('express-mongo-sanitize');


// routers-----------


const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');



// ------error handle---------
const ExpressError = require('./utils/ExpressError');


// db connection check-----------

// const dbURL = process.env.DB_URL
// 
const dbURL = 'mongodb://127.0.0.1:27017/farmers';
mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})


// -----------------

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({ replaceWith: '_' }));


// session test-----------

const secret = process.env.SECRET || 'thisshouldbeasecret';

const store = MongoStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function (e) {
    console.log("session error", e);
})

const sessionConfig = {
    store,
    name: 'CY',
    secret,
    resave: false,
    saveUninitialized: true,

    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

// app.get('/fakeuser',async(req,res) => {
//     const user = new User({email: 'ct@gmail.com',username:'ct'});
//     const newUser = await User.register(user,'chicken');
//     res.send(newUser);
// })


app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





// -------------------------------




app.use((req, res, next) => {

    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.get('/', (req, res) => {
    res.render('home')
});

// --------------------------
app.get('/complaint',isLoggedIn, (req, res) => {
    res.render('complaint')
});


app.post('/complaint', async (req, res) => {
    try {

        const { email, name, complaint, latitude, longitude, phone, category } = req.body;
        const user = new Complaint({ email, name, complaint, geometry: { type: 'Point', coordinates: [longitude, latitude] }, phone, category });
        // const registeredUser = await Complaint.register(user, password);
        await user.save();
        // req.login(registeredUser, err => {
        //     if (err) {
        //         return next(err);
        //     }
        //     req.flash('success', 'Welcome to Yelp Camp!');
        //     res.redirect('/campgrounds');
        // })
        res.redirect('/campgrounds')
    }

    catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
})

const accountSid = "AC5bd5235dcd8c86fc6afb27d65bd62943";
const authToken = "e229b73d3825590b61f5845f4ada7516";
const client = require('twilio')(accountSid, authToken);

const messsageres = (Phone) => {
    const formattedPhone = `whatsapp:${Phone.replace(/[^0-9]/g, '')}`;
     console.log(formattedPhone);
    client.messages
        .create({
            from: 'whatsapp:+14155238886',
            body: 'Hello, there!',
            to: formattedPhone // Use the Phone variable here
        })
        .then(message => console.log(2))
        .catch(error => console.error(error)); // Handle any errors
}


app.delete('/complaint/:id', async (req, res) => {
    const { id } = req.params;
    console.log(id);
    const campground = await Complaint.findById(id);
    const Phone = campground.phone;
    messsageres(Phone);
    console.log(`${Phone}`);
    await Complaint.findByIdAndDelete(id);
    req.flash('success', 'Complaint Resolved');
    res.redirect('/campgrounds');
})

// -------------------








app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/', userRoutes);







// error handler at last----------------------

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = 'Something went Wrong';
    }
    res.status(statusCode).render('error', { err });
})



const port = process.env.PORT || 8001;

app.listen(port, () => {
    console.log(`serving on PORT ${port}`);
})

