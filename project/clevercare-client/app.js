var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoStore = require("connect-mongo")(session);
var mongo = require("mongodb").MongoClient;
var url = require('url');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');


var index = require('./routes/index');
var users = require('./routes/users');
var signin = require('./routes/signin');
var followup = require('./routes/followup');
var review = require('./routes/review');
var analtytics = require('./routes/analytics');
var uploadContent = require('./routes/uploadContent');
var app = express();
app.use(fileUpload());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    store: new mongoStore({
        url: "mongodb://clevercare:94260@ds113628.mlab.com:13628/smartcare"
    })
}));

//Authentication and Authorization Middleware
app.use(function (req, res, next) {
    res.header(
        'Cache-Control',
        'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    var authorizeUrlArr = ["", "/", "/signin"];
    var url_parts = url.parse(req.url, true);
    if (authorizeUrlArr.indexOf(url_parts.pathname.split("/")[0]) > -1) {
        return next();
    } else {
        if (req.session.userId) {
            return next();
        } else {
            res.redirect("/");
        }
    }
});

app.use('/', index);
app.use('/users', users);

app.get('/listFollowUps', followup.listFollowUp);
app.get('/listFollowUps/Critical', followup.listCriticalFollowUp);
app.get('/listFollowUps/Total', followup.listFollowUpTotal);
app.get('/listFollowUps/Patient/:patientId', followup.listFollowUpByPatient);
app.get('/listFollowUps/Review', review.listFollowUpForReview);
app.get('/listFollowUps/Review/Critical', review.listFollowUpForCriticalReview);
app.get('/listFollowUps/Review/Total', review.listFollowUpTotalForReview);
app.get('/listFollowUps/Review/Patient/:patientId', review.listReviewedFollowupByPatient);
app.get('/notes/:userId', signin.noOfNotes);
app.get('/signout', signin.signout);
app.get('/doctorAnalysis', analtytics.doctorAnalysis);
app.get('/predictionAnalysis', analtytics.predictionAnalysis);
app.get('/doctorList',signin.doctorList);

app.post('/signin', signin.authenticateUser);
app.post('/addDoctor', signin.addDoctor);
app.post('/addPatient', signin.addPatient);
app.post('/addAdmin', signin.addAdmin);
app.post('/addNurse', signin.addNurse);
app.post('/submitFollowup', followup.submitFollowup);
app.post('/scheduleFollowup', followup.scheduleFollowup);
app.post('/submitReview', review.submitReview);
app.post('/sendNote', review.sendNote);
app.post('/updateNotes', signin.updateNotes);
app.post('/addNote', signin.addNote);
app.post('/changePassword' ,signin.changePassword);
app.post('/uploadVideo', uploadContent.uploadVideo);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    console.log(err);
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
