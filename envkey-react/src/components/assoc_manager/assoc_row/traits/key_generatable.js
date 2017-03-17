import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import KeyGenerated from "../key_generated"

const KeyGeneratable = AssociationRow => class extends AssociationRow {
  constructor(props){
    super(props)
    this.state = {
      ...(this.state || {}),
      showKeyGenerated: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.assoc.envkey &&
       nextProps.assoc.passphrase &&
       nextProps.assoc.keyGeneratedAt != this.props.assoc.keyGeneratedAt){
      this.setState({showKeyGenerated: true})
    }
  }

  _classNames(){
    return super._classNames().concat([
      (this.state.showKeyGenerated ? " key-generated" : "")
    ])
  }

  _renderContents(){
    return super._renderContents().concat([
      this._renderKeyGenerated()
    ])
  }

  _renderKeyGenerated(){
    if (this.state.showKeyGenerated){
      return h(KeyGenerated, {
        ...this.props,
        ...this.props.assoc,
        onClose: ()=> this.setState({showKeyGenerated: false})
      })
    }
  }
}

export default KeyGeneratable