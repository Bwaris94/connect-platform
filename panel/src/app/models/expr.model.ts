import { Node } from './node.model';
import { Box } from './box.model';


export enum ExprEvents {
  codeChange,
}

export class Expr extends Node {
  public static Result: string = 'result';

  private _code: string;

  constructor(tag: string, box: Box) {
    super(tag, box);
    this.out.add(Expr.Result);
  }

  public get result() { return this.out.get(Expr.Result); }
  public get code() { return this._getCode(); }
  public set code(code) {
    this._setCode(code);
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
}
