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
function parseMethodList(arg) {
  if(typeof (arg) == 'object') {
    var e = [];
    arg.forEach(ar => {
      e.push(cmt(ar))
    })
    return e.join("\n")
  } else {
    return cmt(arg)
  }
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
    if ((typeof route.run == 'object')) throw new Error("The run parameter must be a string.");
    const disable = route.disabled;
    if(typeof disable == 'object') throw new Error("Disabled parameter must not be an object");
    const disabled = !disable ? false : disable;
    if(typeof disabled != 'boolean') throw new Error("Disabled parameter must be a boolean");
    if(disabled) return subarr.unshift(chalk.red("Disabled")),subarr.unshift(file),subarr.unshift(parseArrayList(route.name)),subarr.unshift(!route.method ? cmt("GET") : cmt(route.method.toUpperCase())),mainarr.unshift(subarr);
    if(!route.method) {
      subarr.push(cmt("GET"))
      app.get(parse(route.name),async (req,res) => {
        route.run(req,res)
      })
      subarr.push(parseArrayList(route.name))
      subarr.push(file)
      subarr.push(chalk.green("Enabled"))
    } else {
      if (typeof route.method == 'object') {
        subarr.push(parseMethodList(route.method.filter(x => x != null)))
        route.method.filter(x => x != null).forEach(m => {
          app[m.toLowerCase()](parse(route.name), async (req,res) => {
            route.run(req,res)
          })
        })
        subarr.push(parseArrayList(route.name))
        subarr.push(file)
        subarr.push(chalk.green("Enabled"))
      } else {
        subarr.push(parseMethodList(route.method))
        app[route.method](parse(route.name),async (req,res) => {
          route.run(req,res)
        })
        subarr.push(parseArrayList(route.name))
        subarr.push(file)
        subarr.push(chalk.green("Enabled"))
      }
    }
    mainarr.push(subarr)
  })
  mainarr.unshift([chalk.yellowBright("Method"), chalk.yellowBright("Route"), chalk.yellowBright("File"), chalk.yellowBright("Status")])
  console.log(table(mainarr, tableconf))
}