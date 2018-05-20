import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Link } from '../../../models/link.model';
import { Node } from '../../../models/node.model';
import { Expr } from '../../../models/expr.model';
import { Pin } from '../../../models/pin.model';
import { EditorService } from '../../../services/editor.service';
import { TesterService } from '../../../services/tester.service';


@Component({
  selector: 'editor-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.css']
})
export class LinkComponent implements OnInit {

  @Input() link: Link;
  private _lastFromPos = null;
  private _lastToPos = null;

  constructor(
    private editor: EditorService,
    private tester: TesterService,
  ) { }

  ngOnInit() {
  }

  select() {
    if (this.selected) this.editor.deselect();
    else this.editor.select(this.link);
  }

  public get selected() {
    return this.editor.isSelected(this.link) || this.activeInTester;
  }

  get activeInTester() {
    if (!this.tester.active) return false;
    if (this.link.from.node) {
      return this.tester.events.some(event =>
          event.event.tag == 'node' &&
          event.event.cascaded.tag == this.link.from.node.tag &&
          (event.event.cascaded.cascaded.tag == 'out' ||
          event.event.cascaded.cascaded.tag == 'controlOut') &&
          event.event.cascaded.cascaded.cascaded.tag == this.link.from.item.label
        );
    }
    else return false;
  }

  get fromPos() {
    if (!this._lastFromPos) {
      this._lastFromPos = this._fromPos;
      setTimeout(() => this._lastFromPos = null, 25);
    }
    return this._lastFromPos;
  }

  get toPos() {
    if (!this._lastToPos) {
      this._lastToPos = this._toPos;
      setTimeout(() => this._lastToPos = null, 25);
    }
    return this._lastToPos;
  }

  private get _fromPos() {
    let component = this.link.from.component;
    if (component) return component.pos;

    return {
      left: 0,
      top: 0,
    }
  }

  private get _toPos() {
    if (!this.link.to) {
      let c = this.editor.cursorAbsolute;
      let f = this.fromPos;
      return {
        left: f.left + (c.left - f.left) * .9,
        top: f.top + (c.top - f.top) * .9,
      }
    }

    let component = this.link.to.component;

    if (component) {
      if (this.link.to instanceof Node) {
          let box = component.box;
          if (box) return box.attachPoint(this.fromPos);
      }

      if (this.link.to instanceof Pin) {
        return component.pos;
      }
    }

    return {
      left: 0,
      top: 0,
    }
  }

  get isControl(): boolean {
    return this.link.from.type == this.link.from.types.control;
  }

  get linkWidth() {
    let from = this.fromPos;
    let to = this.toPos;
    let dl = (from.left - to.left);
    let dt = (from.top - to.top);
    return Math.sqrt(dl * dl + dt * dt);
  }

  get linkTransform() {
    let from = this.fromPos;
    let to = this.toPos;
    let dl = (from.left - to.left);
    let dt = (from.top - to.top);
    let angle = Math.atan2(dt, dl) * 180 / Math.PI + 180;

    return `rotate(${angle}deg)`;
  }

  get inPane() {
    return LinkComponent._inPane(this.link.from) &&
          LinkComponent._inPane(this.link.to);
  }

  private static _inPane(obj) {
    return (obj instanceof Node) || (obj instanceof Pin && obj.node);
  }

  @HostListener('document:keyup', ['$event'])
  keypress(event: KeyboardEvent) {
    if (event.keyCode == 27 && this.link.from != null && this.link.to == null) {
      this.editor.releaseFreeLink();
    }
  }
}
