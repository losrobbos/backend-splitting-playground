import express from 'express'
import cors from "cors"
import jwt from 'jsonwebtoken'

const app = express();

const JWT_SECRET = "myHolySecret" // => on change => all granted tickets become invalid

const users = [
  { _id: "u1", name: "Aimee", pw: "aimee123" },
  { _id: "u2", name: "Mo", pw: "mo123" }
]

const todos = [
  { _id: "t1", text: "Show some auth intro", userId: "u1" },
  { _id: "t2", text: "Answer Norman's questions accurately & slowly", userId: "u1" },
  { _id: "t3", text: "Let's make an extended break soon", userId: "u2" },
]

app.use( cors()) // allow access just from specific Frontend URL => requirement for sending cookies!

// REGISTER MIDDLEWARE
app.use( express.json() ) // parse incoming bodies => req.body


// HOME ROUTE
app.get('/', (req, res) => {
  res.send(`<h2>Authentication - Let's check it out, bro...</h2>`);
});

// indentify user
// create / issue a token
app.post('/login', (req, res, next) => {

  const { name, pw } = req.body

  let userFound = users.find(user => user.name == name && user.pw == pw ) // log this user in hardcoded

  if(!userFound) {
    const err = new Error("User does not exist")
    return next(err)
  }

  // sign => create a ticket
  let token = jwt.sign( userFound, JWT_SECRET, { expiresIn: '3m' } )

  // return user data + token merged
  res.json( { ...userFound, token } )
})

// create security guard which will protect confidential routes
const authenticate = (req, res, next) => {

  const token = req.headers.token

  if(!token) {
    const err = new Error("You do not have a token! Get outta herrreeee!")
    return next( err )
  }

  // if somebody presents us a token => VERIFY its signature!
  try {
    const userDecoded = jwt.verify( token, JWT_SECRET )

    req.user = userDecoded // store user info in request

    console.log("Data decoded from token:", userDecoded)
    next() // forward user to desired destination
  }
  catch(err) {
    next( err )
  }
}


app.get("/users", (req, res) => {
	res.json(users)
})

app.get("/todos", authenticate, (req, res) => {
  // get only todos of logged in user
  const userTodos = todos.filter((todo) => todo.userId == req.user._id)
  res.json(userTodos)
})

// GENERAL ERROR HANDLER
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message})
})

const PORT = 5000
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}!`);
});

//Run app, then load http://localhost:5000 in a browser to see the output.
