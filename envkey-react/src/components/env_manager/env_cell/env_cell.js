import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import SmallLoader from 'components/shared/small_loader'
import {imagePath} from 'lib/ui'

export default class EnvCell extends React.Component {

  _actions(){ return [] }

  _valDisplay(){ return this._valString() }

  _valString(){ return this.props.val }

  _classNames(){
    return [
      "cell",
      (this.props.updating ? "updating" : "")
    ]
  }

  render(){
    return h.div({className: this._classNames().join(" ")},
      this._renderCell()
    )
  }

  _renderCell(){
    return [
      h.div(".cell-contents", this._renderCellContents())
    ]
  }

  _renderCellContents(){
    if(this.props.isUpdating){
      return [
        h(SmallLoader)
      ]
    } else {
      return [
        this._renderVal(),
        this._renderActions()
      ]
    }
  }

  _renderActions(){
    return h.div(".actions-overlay", this._actions().map(::this._renderAction))
  }

  _renderAction({type, onClick, img}, i){
    return h.span({className: type, key: i, onClick}, [
      h.img({src: imagePath(img)})
    ])
  }

  _renderVal(){
    return h.span(".val", [this._valDisplay()])
  }
}