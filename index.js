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
  }]
};
function parseArray(arr) {
  if (typeof (arr) != "object") return arr;
  return arr.join("\n")
}
function cmt(m) {
  const str = m.toLowerCase()
  const data = { get: chalk.green('GET'), post: chalk.cyanBright('POST'), put: chalk.yellow('PUT'), delete: chalk.red('DELETE'), patch: chalk.blue('PATCH'), head: chalk.magenta('HEAD'), connect: chalk.cyan('CONNECT'), options: chalk.magentaBright("OPTIONS"), trace: chalk.yellowBright('TRACE') }
  if (!data[str]) return chalk.bgRed(m.toUpperCase());
  return data[str]
}
module.exports = (app,path_to_dir) => {
  if(!app) throw new Error("Must provide app where app = express()")
  if(!path_to_dir) throw new Error("Must provide path_to_dir where path_to_dir = the path to the directory containing all endpoint files (js).")
  console.log(chalk.blueBright("Loading endpoints..."))
  const mainarr = [[chalk.yellowBright("Method"), chalk.yellowBright("Route"), chalk.yellowBright("File")]]
  try {
    fs.accessSync(path_to_dir,fs.R_OK)
  } catch(err) {
    throw new Error("Cannot access path. Please provide the absolute path from root")
  }
  if(!fs.lstatSync(path_to_dir).isDirectory()) throw new Error("Path must be a directory");
  const path = require('path').resolve(path_to_dir)
  fs.readdirSync(path_to_dir).forEach(file => {
    if(fs.lstatSync(path_to_dir + `/${file}`).isDirectory()) return;
    if (file == 'index.js') return;
    const subarr = []
    if(require(`${path}/${file}`)[0]!=null) throw new Error("This package doesn't currently support multiple module.exports in one file.");
    const route = require(`${path}/${file}`);
    if (!route.name) throw new Error(`${file} cannot be loaded due to the route name parameter being empty. Please move the file to a different directory or provide valid parameters to avoid errors.`);
    if (!route.run) throw new Error(`${file} cannot be loaded due to no run parameter provided. Please move the file to a different directory or provide valid parameters to avoid errors.`);
    if ((typeof route.run == 'object') || (typeof route.method == 'object')) throw new Error("The run and method parameter must be a string.");
    subarr.push(!route.method ? cmt("GET") : cmt(route.method.toUpperCase()))
    subarr.push(parseArray(route.name.startsWith("/") ? route.name : `/${route.name}`))
    subarr.push(file)
    app[!route.method ? "get" : route.method.toLowerCase()](route.name.startsWith("/") ? route.name : `/${route.name}`, async (req, res) => {
      route.run(req, res);
    })
    mainarr.push(subarr)
  })
  console.log(table(mainarr, tableconf))
}

module.exports.keeptrack = (app,func,config = {ip:{bool:false},agent:{bool:false},query:false,route:false}) => {
  if(!app) throw new Error("Must provide app where app = express()");
  try {JSON.parse(JSON.stringify(config))} catch(err) {
    throw new Error("Config must be a JSON")
  }
app.use((req,res,next) => {
  const data = {ip:req.ip,"user-agent":req.headers['user-agent'],route:req.url,query:req.query};
  ((bool,header,req)=> {
    if(!bool) return;
    if(typeof bool != 'boolean') throw new Error(`${bool} is not a boolean`);
    if(!header) {
      data.ip = req.ip
    } else {
      data.ip = req.header[header]
    }
  })(!config.ip.bool ? false : config.ip.bool,!config.ip.header ? null : config.ip.header,req);
  ((bool,header,req) => {
    if(!bool) return;
    if(typeof bool != 'boolean') throw new Error(`${bool} is not a boolean`);
    if(!header) {
      data['user-agent'] = req.headers['user-agent']
    } else {
      data['user-agent'] = req.headers[header]
    }
  })(!config.agent.bool ? false : config.agent.bool,!config.agent.header ? null : config.agent.header,req);
  ((bool,req) => {
    if(!bool) return;
    if(typeof bool != 'boolean') throw new Error(`${bool} is not a boolean`);
    data['route'] = req.url
  })(!config.route ? false : config.route,req);
  ((bool,req) => {
    if(!bool) return;
    if(typeof bool != 'boolean') throw new Error(`${bool} is not a boolean`);
    data['query'] = req.query
  })(!config.query ? false : config.query,req);
  return func(data), next();
  })
}

module.exports.page404 = (app,func) => {
  if(!func) {
    app.get('/*',(req,res) => {
      res.sendStatus(404).send({status:404,message:"Not Found"})
    })
  } else {
    app.get('/*',(req,res) => {
      func(req,res)
    })
  }
  console.log(chalk.green("404 page successfully configured..."))
}