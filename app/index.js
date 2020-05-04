const path = require('path');
const platform = require('platform');


platform
  .configure(require('./config'))
  .configure({root: __dirname});

try {
  let panelconf = require('./panel-generated/platform-config');
  platform.configure(panelconf);

  require('./panel-generated/platform-config.script');
} catch(err) {
  console.log(err);
}

try {
  if (process.env.CONNECT_PRODUCTION_MODE) {
    let prodconf = require('./panel-generated/platform-config.prod');
    platform.configure(prodconf);
  }
} catch(err) {
  console.log(err);
}

platform.start()
  .then(server => {
    console.log(`running on http://${server.address().address}` +
                `:${server.address().port}`);
  });
