const core = require('../core');
const { NotFound } = require('./errors');


class Composition {
  constructor() {
    this._inputs = {};
    this._outputs = {};
    this._controlOuts = {};
    this._allOuts = {};
    this._configs = {};
    this._call_dependencies = [];
    this._nodes = {};

    this.meta = {};
  }

  addInput(name) {
    this._inputs[name] = new core.pins.OutputPin();
    return this;
  }

  addOutput(name, control) {
    if (control) {
      let pin = new core.pins.ControlPin();
      this._controlOuts[name] = pin;
      this._allOuts[name] = pin;
      delete this._outputs[name];
    }
    else {
      let pin = new core.pins.InputPin();
      this._outputs[name] = pin;
      this._allOuts[name] = pin;
      delete this._controlOuts[name];
    }

    return this;
  }

  addConfig(name) {
    this._configs[name] = new core.pins.OutputPin();
  }

  removeInput(name) {
    delete this._inputs[name];
    return this;
  }

  removeOutput(name) {
    delete this._outputs[name];
    delete this._controlOuts[name];
    return this;
  }

  removeConfig(name) {
    delete this._configs[name];
    return this;
  }

  addCall(tag, path) {
    this._nodes[tag] = new core.Call(path);
    this._add_dependency(path);
    return this;
  }

  addSwitch(tag, cases) {
    this._nodes[tag] = new core.Switch(cases);
    return this;
  }

  addExpr(tag, ins, expr) {
    this._nodes[tag] = new core.Expression(expr, ins);
    return this;
  }

  addValue(tag, expr) {
    this._nodes[tag] = new core.Expression(expr, []);
    return this;
  }

  removeNode(tag) {
    if (tag in this._nodes) {
      if (this._nodes[tag] instanceof core.Call) {
        this._remove_dependency(this._nodes[tag].path);
      }

      delete this._nodes[tag];
    }

    return this;
  }

  node(tag) {
    if (!(tag in this._nodes)) throw new NotFound(`node ${tag}`);
    return this._nodes[tag];
  }

  reset() {
    for (let node of Object.values(this._nodes)) node.reset();
    for (let pin of Object.values(this._inputs)) pin.reset();
    for (let pin of Object.values(this._outputs)) pin.reset();
    for (let pin of Object.values(this._controlOuts)) pin.reset();
    for (let pin of Object.values(this._configs)) pin.reset();

    return this;
  }

  start(inputs, configs) {
    for (let [input, pin] of Object.entries(this._inputs))
      pin.send(inputs[input]);

    for (let [config, pin] of Object.entries(this._configs))
      pin.send(configs[config]);

    for (let node of Object.values(this._nodes))
      node.checkActivate();
  }

  get signature() {
    return Object.assign({}, this.meta, {
      inputs: Object.keys(this._inputs),
      outputs: Object.keys(this._outputs),
      controlOutputs: Object.keys(this._controlOuts),
      dependencies: {
        config: Object.keys(this._configs),
        calls: this._call_dependencies,
      }
    });
  }

  get nodes() { return this._nodes; }
  get configs() { return this._configs; }
  get inputs() { return this._inputs; }
  get outputs() { return this._allOuts; }

  _add_dependency(path) {
    if (this._call_dependencies.indexOf(path) == -1)
      this._call_dependencies.push(path);
  }

  _remove_dependency(path) {
    this._call_dependencies = this._call_dependencies.filter(p => p != path);
  }
}

module.exports = {
  Composition: Composition,
}
