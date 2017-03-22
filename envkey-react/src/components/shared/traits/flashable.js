import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'

const Flashable = Wrapped => class extends Wrapped {

  constructor(props){
    super(props)
    this.state = R.merge((this.state || {}), {
      showFlash: false,
      flashText: ""
    })
  }

  flash(txt){
    this.setState({showFlash: true, flashText: txt})
    setTimeout(this.setState.bind(this, {showFlash: false, flashText: ""}), 1100)
  }

  _renderFlash(){
    if (this.state.showFlash){
      return h.div(".msg-flash", {className: (this.state.showFlash && this.state.flashText ? "show": "")},[
        h.span(this.state.flashText)
      ])
    }
  }

}

export default Flashable