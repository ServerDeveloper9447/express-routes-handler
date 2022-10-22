# Express Routes Handler
### _Simple Express Routes Handler for Beginners_

> **Now comes pre-installed with express**

---
**Simple start**
`index.js`
```js
const express = require('express'); //ah yes, semicolons
/* Or you can do
const {express} = require('express-routes-handler');
*/
const handler = require('express-routes-handler');
const app = express();
```

**Now create a folder with your desired name. I chose `routes`.<br>
This folder will have all the routes folder.**

Now create any file in there.<br>
Example: `status.js`

Now put inside this code:
```js
module.exports = {
  name: '/status', // This can be an array.
  disabled: false, // Can be omitted. Stops from the endpoint being loaded. Default is false
  method: 'get', // Can be omitted. Default is 'get'
  run: (req, res) => { // Like a normal function
    res.sendStatus(200)
  }
}
// Disabled endpoints show up at the top of the table in console
```

After you've done this go to the main `index.js` file and do this
```js
const express = require('express'); //ah yes, semicolons
const app = express();
const handler = require('express-routes-handler');

handler(app,'./routes'); // This loads all the endpoints in routes folder

//Now for the listener part
app.listen(/*Port name*/,/*Omittable callback function*/);
```
Now you've got yourself a simple express app.

---

This package comes with a handy 404 page support.
```js
handler.page404( app, ( req , res ) => {
    // res.status(404).send({status:404})
    // Or something of your choice
})
// This must be put before the handler(app,'./routes') function
```

---

Or to keep track of the requests
```js
handler.keeptrack(app,/* Omittable too => */(data) => {
    console.log(data)
},/*Here lies the omitttable config*/)
// This also must be put before the handler(app,'./routes') function
```
---
What may the config contain. (Already filled keys are default values)
```js
const options = { 
    ip: true, // IP tracking enabled?
    ip_header: '', // IP tracking header
    agent: true, // User-agent tracking enabled?
    agent_header: '', // User-agent header
    query: true, // Query parameter tracking enabled?
    route: true // Route tracking enabled?
} 
```
---
> Changelog 22-Oct-22
> ```diff
> + Code Documentation
> + Fixed some array problems
> + Changed the structure keys of config
> + Added disabled param
> + Added a status column to the console table
> ```
---
## This package may or may not be used in advanced development
This package will not be responsible for breaking of your express server (honestly, how that would even happen?)<br>Feel free to check the source code and suggest new features<br>
More features will be added soon.
<br><br>

# Made with &#128150; by Server Developer#9447

## **[Source Code](https://github.com/ServerDeveloper9447/express-routes-handler "Github Link")**<br>
**[Support Server](https://discord.gg/VqA92g8 "Discord Support Server Link")**<br>
**[Developer](https://duck.is-a.dev "Duck Dev")**