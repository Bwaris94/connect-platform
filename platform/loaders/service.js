const axios = require('axios');
const core = require('../core');


module.exports = (service) => {

  //TODO: do a properly colored message here.
  //

  console.log(`loading service ${service.name} on ${service.url}`);
  axios.get(service.url + '/api').then(response => {
    if (response.data) {
      response.data.forEach(signature => {
        let sig = Object.assign({}, signature, {
          path: `${service.name}:${signature.path}`,
          public: false,
          outputs: signature.outputs || [],
        });

        sig.outputs.push('#error');

        let method = (signature.method)?(signature.method.toLowerCase()):('get');

        //TODO: this should be moved to its own separate module.
        //
        core.node(sig, (inputs, output, control, error) => {
          let path = signature.path;
          signature.inputs.forEach(input => {
            path = path.replace(':' + input, inputs[input]);
          });

          let req;

          if (method == 'get') req = axios.get(service.url + path, { params: inputs });
          if (method == 'post') req = axios.post(service.url + path, { params: inputs });
          if (method == 'put') req = axios.put(service.url + path, { params: inputs });
          if (method == 'delete') req = axios.delete(service.url + path, { params: inputs});

          if (!req) {
            output('#error', 'protocol mismatch');
            return;
          }

          req.then(response => {
              if (response.data) {
                if (typeof response.data === 'string') {
                  if (signature.controlOutputs.includes(response.data)) {
                    control(response.data);
                    return;
                  }
                }
                else {
                  let keys = Object.keys(response.data);
                  for (let key of keys) {
                    if (signature.outputs.includes(key)) {
                      output(key, response.data[key]);
                      return;
                    }
                  }
                }

                output('#error', 'signature mismatch');
              }

              output('#error', 'protocol mismatch');
            })
            .catch(err => {
              if (err.response && err.response.data) output('#error', err.response.data);
              else output('#error', err);
            });
        });
      })
    }
  }).catch(error => {

    //TODO: do a properly colored message here.
    //

    console.log(error);
  });
}
