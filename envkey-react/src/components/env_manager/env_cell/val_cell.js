import h from "lib/ui/hyperscript_with_helpers"
import EnvCell from './env_cell'
import {imagePath} from 'lib/ui'
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

    if(this.props.val === null){
      return this._undefinedVal()
    }

    if(this.props.val === ""){
      return h.small("empty string")
    }

    if(!this.props.isUpdating && this.props.hideValues){
      return "●●●●●●●●●●●●";
    } else {
      return this.props.val
    }
  }

  _valString(){
    return this.props.inherits ? inheritedVal(this.props) : super._valString()
  }

}