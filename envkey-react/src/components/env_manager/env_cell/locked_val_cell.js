import h from "lib/ui/hyperscript_with_helpers"
import ValCell from './val_cell'
import SocketEditable from './traits/socket_editable'
import {imagePath} from 'lib/ui'

export default class LockedValCell extends SocketEditable(ValCell) {

  _classNames(){
    return super._classNames().concat([
      "locked"
    ])
  }

  _valDisplay(){
    if (this._showLockImg()){
      const img = h.img(".img-locked", {src: imagePath("padlock.svg")})
      return [img, super._valDisplay()]
    }
    return super._valDisplay()
  }

  _showLockImg(){
    return true
  }

}