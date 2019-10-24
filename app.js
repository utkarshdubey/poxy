const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const path = require('path');
const flash = require('express-flash');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const dockerNames = require('docker-names');
const dotenv = require('dotenv');

// Environment Variables for Credentials
dotenv.config();

// Additional Functions
function validateUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

// Flash messaging
//session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));


app.use(flash());

// App local variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.link_msg = req.flash('link_msg');
  next();
});

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Method override middleware
app.use(methodOverride('_method'));

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
// Connect to mongoose
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Model Imports
require('./models/Link');
const Link = mongoose.model('links');

// Mongoose Functions
function findLink(link) {
  Link.findOne({
    link: link
  }).exec(function (err, user) {
    if (user) {
      return true;
    } else {
      return false;
    }
  })
}

// Index Route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {
    title: title,
    success: req.flash('success_msg'),
    error: req.flash('error_msg'),
    link: req.flash('link_msg')
  });
});

// More Routes Below 🙃
app.post('/shorten', (req, res) => {
  if (!validateUrl(req.body.link)) {
    req.flash('error_msg', 'The link entered seems invalid, try again.')
    return res.redirect('/');
  }
  Link.findOne({link: req.body.link}).exec(function(err, link){
    if(link){
      req.flash('success_msg', 'Link has been generated successfully.');
        req.flash('link_msg', link.new_link);
        return res.redirect('/');
    }

    const options = {
      link: req.body.link,
      new_link: dockerNames.getRandomName(true),
    }
    new Link(options)
      .save()
      .then(link => {
        req.flash('success_msg', 'Link has been generated successfully.');
        req.flash('link_msg', link.new_link);
        return res.redirect('/');
      })
  }) 

})

// Main routes
app.get('/:id', (req, res) => {
  Link.findOne({new_link: req.params.id}).exec(function(err, link){
    if(link){
      return res.redirect(link.link);
    }
    else{
      return res.render('404');
    }
  })
})

// Server Setup here :}
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});