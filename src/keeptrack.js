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
 * @param {Boolean} [options.method] - Method tracking enabled?. Default = true (optional)
 */
 module.exports = (app, func, options = { ip: true, 'ip_header': '', agent: true, 'agent_header': '', query: true, route: true, method:true}) => {
    var config = { ip: true, 'ip_header': '', agent: true, 'agent_header': '', query: true, route: true, method:true};
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
      ((bool,req) => {
        if (bool == false) return delete data['query'];
        if (typeof bool != 'boolean') throw new Error(`${bool} is not a boolean`);
        data['method'] = req.method
      })(!config.method ? false : config.method, req);
      return func(data), next();
    })
  }