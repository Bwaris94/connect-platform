import { Subscribable } from '../base/subscribable';


export enum BoxEvents {
  anchor, move
}

export class Box extends Subscribable {
  private _left: number;
  private _top: number;
  private _width: number;
  private _height: number;
  private _anchor: any;

  constructor(left, top, width, height) {
    super();
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
  }

  public get left() { return this._left; }
  public get top() { return this._top; }
  public get width() { return this._width; }
  public get height() { return this._height; }
  public get right() { return this.left + this.width; }
  public get bottom() { return this.top + this.height; }

  public get center() {
    return {
      left: this.left + this.width / 2,
      top: this.top + this.height / 2,
    }
  }

  public get centerLeft() {
    return {
      left: this.left,
      top: this.center.top,
    }
  }

  public get centerRight() {
    return {
      left: this.right,
      top: this.center.top,
    }
  }

  public get centerTop() {
    return {
      top: this.top,
      left: this.center.left,
    }
  }

  public get centerBottom() {
    return {
      top: this.bottom,
      left: this.center.left,
    }
  }

  public set left(_left) { this._left = _left; }
  public set top(_top) { this._top = _top; }
  public set width(_width) { this._width = _width; }
  public set height(_height) { this._height = _height; }

  public get anchor() { return this._anchor || this.center; }

  public pick(_anchor): Box {
    this._anchor = _anchor;
    this.publish(BoxEvents.anchor, _anchor);
    return this;
  }

  public move(_pos): Box {
    this.left = _pos.left - this.anchor.left;
    this.top = _pos.top - this.anchor.top;
    this.publish(BoxEvents.move, {left: this.left, top: this.top});
    return this;
  }
}
