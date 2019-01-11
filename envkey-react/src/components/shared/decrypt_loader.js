import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"
import Spinner from "./spinner"

export default class DecryptLoader extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      showSpinner: props.isDecrypting
    }
  }

  componentWillReceiveProps(nextProps){
    if (this.props.isDecrypting && !nextProps.isDecrypting){
      this._clearSpinnerTimeout()
      this.spinnerTimeout = setTimeout(()=>{
        this.setState({showSpinner: false})
      }, 2000)
    }

    if (nextProps.isDecrypting){
      this._clearSpinnerTimeout()
      this.setState({showSpinner: true})
    }
  }

  componentWillUnmount(){
    this._clearSpinnerTimeout()
  }

  _clearSpinnerTimeout(){
    if (this.spinnerTimeout){
      clearTimeout(this.spinnerTimeout)
      this.spinnerTimeout = null
    }
  }

  render(){
    const {isDecrypting} = this.props
    return h.div(".viewport-overlay", {
      className: (isDecrypting ? "" : "hide")
    }, [
      h.div(".overlay-loader.decrypt-loader", [
        h.span(".label", "Decrypting config..."),
        (this.state.showSpinner ? h(Spinner) : "")
      ])
    ])
  }

}