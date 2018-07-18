const path = require('path');

const platform = require('../../../');
const config = require('../util/config');
const files = require('../util/file-io');
const authorize = require('../util/authorize');


platform.core.node({
  path : `${config.path}config`,
  public : config.expose,
  method : 'GET',
  inputs : ['connect_token'],
  outputs : ['config'],
  controlOutputs: [ platform.conventions.controls._Unauthorized ],
}, (inputs, output, control) => {
  authorize(inputs.connect_token)
    .then(() => {
      let conffile = path.join(config.directory, config.files.platformconf);
      files.json.load(conffile).then(conf => {
        output('config', conf);
      }).catch(error => {
        output('config', {});
      });
    })
    .catch(error => {
      control(platform.conventions.controls._Unauthorized);
    });
});
