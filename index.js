const fs = require('fs');
const chalk = require('chalk')
const { table } = require('table')
const tableconf = {
  border: {
    topBody: `-`,
    topJoin: `-`,
    topLeft: `-`,
    topRight: `-`,

    bottomBody: `-`,
    bottomJoin: `-`,
    bottomLeft: `-`,
    bottomRight: `-`,

    bodyLeft: `|`,
    bodyRight: `|`,
    bodyJoin: `|`,

    joinBody: `-`,
    joinLeft: `-`,
    joinRight: `-`,
    joinJoin: `-`
  },
  columns: [{
    alignment: 'center'
  }, {
    alignment: 'center'
  }, {
    alignment: 'center'
  }, {
    alignment: 'center'
  }]
};
function parseArrayList(arr) {
  if (typeof (arr) == "object") {
    const e = []
    arr.forEach(m => {
      if (m.startsWith("/")) {
        e.push(m)
      } else {
        e.push(`/${m}`)
      }
    })
    return e.join("\n");
  } else {
    if (arr.startsWith("/")) {
      return arr
    } else {
      return `/${arr}`
    }
  }
}
function parse(arg) {
  if (typeof (arg) == 'object') {
    const e = []
    arg.forEach(m => {
      if (m.startsWith("/")) {
        e.push(m)
      } else {
        e.push(`/${m}`)
      }
    })
    return e
  } else {
    if (arg.startsWith("/")) {
      return arg
    } else {
      return `/${arg}`
    }
  }
}
function cmt(m) {
  const str = m.toLowerCase()
  const data = { get: chalk.green('GET'), post: chalk.cyanBright('POST'), put: chalk.yellow('PUT'), delete: chalk.red('DELETE'), patch: chalk.blue('PATCH'), head: chalk.magenta('HEAD'), connect: chalk.cyan('CONNECT'), options: chalk.magentaBright("OPTIONS"), trace: chalk.yellowBright('TRACE') }
  if (!data[str]) return chalk.bgRed(m.toUpperCase());
  return data[str]
}
/**
* @param {Object} app Express Initialized. Ex: `express()`
* @param {String} path_to_dir Path to the directory with all the endpoint files
* @returns null
*/
module.exports = (app, path_to_dir) => {
  if (!app) throw new Error("Must provide app where app = express()")
  if (!path_to_dir) throw new Error("Must provide path_to_dir where path_to_dir = the path to the directory containing all endpoint files (js).")
  console.log(chalk.blueBright("Loading endpoints..."))
  const mainarr = []
  try {
    fs.accessSync(path_to_dir, fs.R_OK)
  } catch (err) {
    throw new Error("Cannot access path. Please provide the absolute path from root")
  }
  if (!fs.lstatSync(path_to_dir).isDirectory()) throw new Error("Path must be a directory");
  const path = require('path').resolve(path_to_dir)
  fs.readdirSync(path_to_dir).forEach(file => {
    if (fs.lstatSync(path_to_dir + `/${file}`).isDirectory()) return;
    const subarr = []
    if (require(`${path}/${file}`)[0] != null) throw new Error("This package doesn't currently support multiple module.exports in one file.");
    const route = require(`${path}/${file}`);
    if (!route.name) throw new Error(`${file} cannot be loaded due to the route name parameter being empty. Please move the file to a different directory or provide valid parameters to avoid errors.`);
    if (!route.run) throw new Error(`${file} cannot be loaded due to no run parameter provided. Please move the file to a different directory or provide valid parameters to avoid errors.`);
    if ((typeof route.run == 'object') || (typeof route.method == 'object')) throw new Error("The run and method parameter must be a string.");
    const disable = route.disabled;
    if(typeof disable == 'object') throw new Error("Disabled parameter must not be an object");
    const disabled = !disable ? false : disable;
    if(typeof disabled != 'boolean') throw new Error("Disabled parameter must be a boolean");
    if(disabled) return subarr.unshift(chalk.red("Disabled")),subarr.unshift(file),subarr.unshift(parseArrayList(route.name)),subarr.unshift(!route.method ? cmt("GET") : cmt(route.method.toUpperCase())),mainarr.unshift(subarr);
    subarr.push(!route.method ? cmt("GET") : cmt(route.method.toUpperCase()))
    subarr.push(parseArrayList(route.name))
    subarr.push(file)
    subarr.push(chalk.green("Enabled"))
    app[!route.method ? "get" : route.method.toLowerCase()](parse(route.name), async (req, res) => {
      route.run(req, res);
    })
    mainarr.push(subarr)
  })
  mainarr.unshift([chalk.yellowBright("Method"), chalk.yellowBright("Route"), chalk.yellowBright("File"), chalk.yellowBright("Status")])
  console.log(table(mainarr, tableconf))
}

/**
 * 
 * @param {Object} app - Express initialized. Ex: `express()`
 * @param {Function} func - Function returning the tracked data. Executes every request to the server.
 * @param {Object} [options] - Configuration for keeping track of data.
 * @param {Boolean} [options.ip] - IP tracking enabled?. Default = true (optional)
 * @param {String} [options.ip_header] - Header in which the IP will be contained (optional)
 * @param {Boolean} [options.agent] - User-Agent tracking enabled?. Default = true (optional)
 * @param {String} [options.agent_header] - Header in which the User-Agent will be contained. (optional)
 * @param {Boolean} [options.query] - Query params tracking enabled?. Default = true (optional)
 * @param {Boolean} [options.route] - Route tracking enabled?. Default = true (optional)
 * @returns { ip: , "user-agent": , route: , query:  }
 */
module.exports.keeptrack = (app, func, options = { ip: true, 'ip_header': '', agent: true, 'agent_header': '', query: true, route: true}) => {
  var config = { ip: true, 'ip_header': '', agent: true, 'agent_header': '', query: true, route: true};
  Object.keys(options).forEach(f => {
    config[f] = options[f]
  });
  Object.keys(config).forEach(m => {
    if (typeof options[m] == 'object') {
      throw new Error(`${m} must be a string.`)
    }
  })
  if (!app) throw new Error("Must provide app where app = express()");
  try { JSON.parse(JSON.stringify(config)) } catch (err) {
    throw new Error("Config must be a JSON")
  }

  app.use((req, res, next) => {
    var data = { ip: req.ip, "user-agent": req.headers['user-agent'], route: req.url, query: req.query };
    ((bool, header, req) => {
      if (bool == false) return delete data['ip'];
      if (typeof bool != 'boolean') throw new Error(`${bool} is not a boolean`);
      if (!header) {
        data.ip = req.socket.remoteAddress
      } else {
        data.ip = req.headers[header]
      }
    })(!config.ip ? false : config.ip, !config['ip_header'] ? null : config['ip_header'], req);
    ((bool, header, req) => {
      if (bool == false) return delete data['user-agent'];
      if (typeof bool != 'boolean') throw new Error(`${bool} is not a boolean`);
      if (!header) {
        data['user-agent'] = req.headers['user-agent']
      } else {
        data['user-agent'] = req.headers[header]
      }
    })(!config.agent ? false : config.agent, !config['agent_header'] ? null : config['agent_header'], req);
    ((bool, req) => {
      if (bool == false) return delete data['route'];
      if (typeof bool != 'boolean') throw new Error(`${bool} is not a boolean`);
      data['route'] = req.url
    })(!config.route ? false : config.route, req);
    ((bool, req) => {
      if (bool == false) return delete data['query'];
      if (typeof bool != 'boolean') throw new Error(`${bool} is not a boolean`);
      data['query'] = req.query
    })(!config.query ? false : config.query, req);
    return func(data), next();
  })
}
/**
 * 
 * @param {Object} app - Express initialized. Ex: `express()` 
 * @param {Function} func - The function to return a 404 page (optional) Default =
 * ```js
 *  { status: 404, message: "Not Found" }
 * ```
 */
module.exports.page404 = (app, func) => {
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

module.exports.express = require('express')