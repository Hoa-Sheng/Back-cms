require('dotenv').config();

require('./connection.js');
var express = require('express');
var path = require('path');
const cors = require('cors')
var cookieParser = require('cookie-parser');
var logger = require('morgan');



var usersRouter = require('./models/user.js');
const categorieRouter = require('./routes/categories.js');
const articleRouter = require('./routes/article.js');
const commentRouter = require('./routes/comment.js');
const authRouter = require('./routes/auth.js');
const tagRouter = require('./routes/tag.js');
const aboRouter = require('./routes/abo.js');
const likeRouter = require('./routes/like.js');



var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use('/uploads', express.static(path.join(__dirname, 'routes/uploads')));




app.use('/tag', tagRouter);
app.use('/user', usersRouter);
app.use('/categorie', categorieRouter);
app.use('/article', articleRouter);
app.use('/comment', commentRouter);
app.use('/auth', authRouter);
app.use('/', aboRouter);
app.use('/', likeRouter);



module.exports = app;
