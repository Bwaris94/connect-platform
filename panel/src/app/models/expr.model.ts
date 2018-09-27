import { Node } from './node.model';
import { Box } from './box.model';


export enum ExprEvents {
  codeChange,
}

export class Expr extends Node {
  public static Result: string = 'result';

  private _code: string;
  private _expanded: boolean = false;

  constructor(tag: string, box: Box) {
    super(tag, box);
    this.out.add(Expr.Result);
  }

  public get result() { return this.out.get(Expr.Result); }
  public get code() { return this._getCode(); }
  public set code(code) {
    this._setCode(code);
  }

  public get expanded(): boolean { return this._expanded; }

  public expand() {
    this.box.width = 288;
    this._expanded = true;
  }

  public collapse() {
    this.box.width = 172;
    this._expanded = false;
  }

  protected toJson() {
    if (this.in.items.length > 0)
      return Object.assign(super.toJson(), {
        in : this.in.items.map(i => i.label),
        expr : this.code,
      });
    else
      return Object.assign(super.toJson(), {
        expr : this.code,
      });
  }

  protected _setCode(code: string) {
    this._code = code;
    this.publish(ExprEvents.codeChange, code);
  }

  protected _getCode() {
    return this._code;
  }

  public static emptyExpr(tag: string, left: number, top: number): Expr {
    let expr = new Expr(tag, new Box(left, top, 172, 32));
    expr.code = '//something...';
    return expr;
  }

  public static fromJson(json) {
    let expr = new Expr(json.tag, Box.fromJson(json.box));
    expr.code = json.expr;
    for (let i of json.in) {
      expr.in.add(i);
    }

    return expr;
  }
}
