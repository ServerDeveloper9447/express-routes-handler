const chalk = require('chalk')
/**
 * 
 * @param {Object} app - Express initialized. Ex: `express()` 
 * @param {Function} func - The function to return a 404 page (optional) Default =
 * ```js
 *  { status: 404, message: "Not Found" }
 * ```
 */
 module.exports = (app, func) => {
    if (!func) {
      app.all('/*', (req, res) => {
        res.status(404).send({ status: 404, message: "Not Found" })
      })
    } else {
      app.all('/*', (req, res) => {
        func(req, res)
      })
    }
    console.log(chalk.green("404 page successfully configured..."))
  }