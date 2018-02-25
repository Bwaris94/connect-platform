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
    this.addOut(Expr.Result);
  }

  public get code() { return this._getCode(); }
  public set code(code) {
    this._setCode(code);
  }

  protected _setCode(code: string) {
    this._code = code;
    this.publish(ExprEvents.codeChange, code);
  }

  protected _getCode() {
    return this._code;
  }

  private static _count = 0;

  public static emptyExpr(left: number, top: number): Expr {
    Expr._count++;
    return new Expr(`e${Expr._count}`, new Box(left, top, 192, 32));
  }
}
