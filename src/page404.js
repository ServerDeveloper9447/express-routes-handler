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
      app.get('/*', (req, res) => {
        res.status(404).send({ status: 404, message: "Not Found" })
      })
    } else {
      app.get('/*', (req, res) => {
        func(req, res)
      })
    }
    console.log(chalk.green("404 page successfully configured..."))
  }