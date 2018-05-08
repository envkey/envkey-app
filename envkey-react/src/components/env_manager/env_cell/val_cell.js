import h from "lib/ui/hyperscript_with_helpers"
import EnvCell from './env_cell'
import {inheritedVal} from 'lib/env/inheritance'

export default class ValCell extends EnvCell {

  _classNames(){
    return super._classNames().concat([
      "val-cell",
      (this.props.inherits ? "inherits" : ""),
      (!this.props.inherits && this.props.val === null ? "deleted" : ""),
      (this.props.val === "" ? "empty" : "")
    ])
  }

  _undefinedVal(){
    return h.small("undefined")
  }

  _valDisplay(){
    if(this.props.inherits){
      return h.span([
        h.small("inherits"),
        this.props.inherits
      ])
    }

    if(this.props.val === null && !(this.props.locked && this.props.hasVal)){
      return this._undefinedVal()
    }

    if(this.props.val === ""){
      return h.small("empty string")
    }

    if(this.props.locked || (!this.props.isUpdating && this.props.hideValues)){
      return "●●●●●●●●●●●●";
    } else {
      return this._valString()
    }
  }

  _valString(){
    return this.props.inherits ? (inheritedVal(this.props) || this.props.inheritedVal) : super._valString()
  }

}