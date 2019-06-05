import { Subscribable } from '../util/subscribable';
import { AbstractNode } from './abstract-node.model';
import { PinListItem } from './pin-list.model';


export enum PinType {
  input, output, control,
}

export enum PinTag {
  input, config, output, control,
}

export enum PinEvents {
  attach,
  activate,
}

export class Pin extends Subscribable {
  public types = PinType;
  public tags = PinTag;
  public active: boolean = false;

  private _node: AbstractNode;
  private _type: PinType;
  private _tag: PinTag;
  private _item: PinListItem;
  private _component: any;

  constructor(type: PinType, nodeOrTag?: AbstractNode | PinTag) {
    super();
    this._type = type;

    if (nodeOrTag instanceof AbstractNode)
      this._node = nodeOrTag;
    else
      this._tag = nodeOrTag;
  }

  public get component() { return this._component; }
  public set component(comp) {
    this._component = comp;
    this.publish(PinEvents.attach, comp);
  }

  public activate() {
    this.active = true;
    this.publish(PinEvents.activate);
  }

  public get item() { return this._item; }
  public set item(item : PinListItem) {
    this._item = item;
  }

  public get node() { return this._node; }
  public get type() { return this._type; }
  public get tag():PinTag { return this._tag; }

  public get json() {
    if (!this.item) return {};

    if (this.node) {
      let res = {};
      res[this.node.tag] = {};

      if (this.node.is('switch')) {
        if (this.type == PinType.input) {
          res[this.node.tag] = this.item.label;
          return res;
        }

        if (this.type == PinType.control) {
          res[this.node.tag]["case"] = this.item.label;
          return res;
        }
      }

      if (this.node.is('value')) {
        res[this.node.tag] = this.item.label;
        return res;
      }

      if (this.node.is('expr') && this.type == PinType.output) {
        res[this.node.tag] = this.item.label;
        return res;
      }

      if (this.type == PinType.input) {
        res[this.node.tag]["in"] = this.item.label;
        return res;
      }

      if (this.type == PinType.output) {
        res[this.node.tag]["out"] = this.item.label;
        return res;
      }

      if (this.type == PinType.control) {
        res[this.node.tag]["control"] = this.item.label;
        return res;
      }
    }

    if (this.tag != undefined) {
      let _tag = this.tag as PinTag;
      if (_tag == PinTag.input) return {"in": this.item.label};
      if (_tag == PinTag.config) return {"config": this.item.label};
      if (_tag == PinTag.output) return {"out": this.item.label};
      if (_tag == PinTag.control) return {"out": this.item.label};
    }

    return {}
  }
}
