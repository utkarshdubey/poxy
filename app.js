const express = require('express');
const exphbs  = require('express-handlebars');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const mongoose = require('mongoose');

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Method override middleware
app.use(methodOverride('_method'));

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
// Connect to mongoose
mongoose.connect("mongodb://admin:KeanuReeves1@ds036178.mlab.com:36178/link-shortener", {
  useNewUrlParser: true
})
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Index Route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {
    title: title
  });
});

// More Routes Below 🙃


// Server Setup here :}
const port = process.env.PORT || 5000;

app.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});