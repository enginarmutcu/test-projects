require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const {check,body,validationResult} = require('express-validator');

app.use(express.json())

const posts = [
  {
    username: 'Kyle',
    title: 'Post 1'
  },
  {
    username: 'Jim',
    title: 'Post 2'
  }
]

app.get('/posts', authenticateToken, (req, res) => {
  res.json(posts.filter(post => post.username === req.user.name))
})

app.get('/allPosts', authenticateToken, (req, res) => {
    res.json(posts)
  })
app.post('/addPost', authenticateToken, [
    check('username').not().isEmpty().isLength({ min: 5 }).withMessage("username should be at least 5 letters"),
    body('title').trim().isLength({ min: 5 }).isEmail()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    posts.push({
        username : req.body.username,
        title : req.body.title
    })
    res.json(posts)
  })

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.listen(3000)