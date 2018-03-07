import { Node } from './node.model';
import { Box } from './box.model';
import { Signature } from './signature.model';


export enum CallEvents {
  signatureChange, pathChange,
}

export class Call extends Node {
  private _signature: Signature;
  private _path: string;

  public get signature() { return this._signature; }
  public set signature(_signature: Signature) {
    this.publish(CallEvents.signatureChange, _signature);
    this._signature = _signature;
    this._adoptSignature();
  }

  public get path() { return this._path; }
  public set path(path : string) {
    this._path = path;
    this.publish(CallEvents.pathChange, path);
  }

  protected toJson() {
    return Object.assign(super.toJson(), {
      path : this.path,
    });
  }

  private _adoptSignature() {
    super.reset();
    if (this.signature) {
      this.signature.inputs.forEach(input => this.in.add(input));
      this.signature.outputs.forEach(output => this.out.add(output));
      if (this.signature.controlOutputs)
        this.signature.controlOutputs.forEach(control => this.control.add(control));
    }
  }

  public static emptyCall(tag: string, left: number, top: number): Call {
    let call = new Call(tag, new Box(left, top, 196, 32));
    call.path = '/path-to-node/';
    call.signature = {
      path: '/path-to-node/',
      inputs: [],
      outputs: [],
      controlOutputs: []
    };
    return call;
  }
}
