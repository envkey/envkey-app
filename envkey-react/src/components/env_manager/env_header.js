import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import { imagePath } from "lib/ui"
import BroadcastLoader from 'components/shared/broadcast_loader'


export default class EnvHeader extends React.Component {
  constructor(props){
    super(props)
    this.state = { showBroadcastLoader: props.isUpdatingEnv }
  }

  componentWillReceiveProps(nextProps){
    if (this.props.isUpdatingEnv && !nextProps.isUpdatingEnv){
      this._clearBroadcastLoaderTimeout()
      this.broadcastLoaderTimeout = setTimeout(()=>{
        this.setState({showBroadcastLoader: false})
      }, 2000)
    }

    if (nextProps.isUpdatingEnv){
      this._clearBroadcastLoaderTimeout()
      this.setState({showBroadcastLoader: true})
    }
  }

  _clearBroadcastLoaderTimeout(){
    if (this.broadcastLoaderTimeout){
      clearTimeout(this.broadcastLoaderTimeout)
      this.broadcastLoaderTimeout = null
    }
  }

  render(){
    return h.header(".env-header", [
      this._renderTitleCell(),
      this._renderShowHide(),
      this._renderUpdatingEnv()
    ])
  }

  _renderTitleCell(){
    return h.div(".label-cell.title-cell", {key: "title"}, [
      h.label(this.props.parent.name)
    ])
  }

  _renderShowHide(){
    return h.label(".show-hide",[
      h.input({
        type: "checkbox",
        checked: this.props.hideValues,
        onClick: this.props.onToggleHideValues
      }),
      h.img({src: imagePath("hide-white.svg")})
    ])
  }

  _renderUpdatingEnv(){
    if (this.state.showBroadcastLoader){
      return h.span(".updating-env-msg", [
        h(BroadcastLoader),
        h.span("Encrypting and syncing")
      ])
    }
  }
}