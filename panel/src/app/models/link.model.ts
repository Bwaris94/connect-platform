import { Subscribable } from '../util/subscribable';
import { Pin, PinType } from './pin.model';
import { Node } from './node.model';


export class Link extends Subscribable {
  private _from: Pin;
  private _to: Pin | Node;

  constructor(from: Pin, to: Pin | Node) {
    super();
    this._from = from;
    this._to = to;
  }

  public get from(): Pin { return this._from; }
  public get to(): Pin | Node { return this._to; }

  public set to(pin: Pin | Node) {
    if (this.compatible(pin))
      this._to = pin;
  }

  public compatible(target: Pin | Node): boolean {
    if (this._to != null) return false;

    if (target instanceof Pin) {
      let pin = target as Pin;
      if (pin.node && pin.node == this._from.node) return false;

      if (this._from.type == PinType.output)
        return pin.type == PinType.input;
      if (this._from.type == PinType.control)
        return (pin.type == PinType.input) && pin.node == null;
    }

    if (target instanceof Node) {
      return this._from.type == PinType.control;
    }

    return false;
  }

  public get json() {
    return [this.from.json,
            (this.to instanceof Node)?
            (this.to.tag):(this.to.json)];
  }
}
