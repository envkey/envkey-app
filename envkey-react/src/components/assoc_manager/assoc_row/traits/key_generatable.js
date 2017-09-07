import h from "lib/ui/hyperscript_with_helpers"
import R from 'ramda'
import KeyGenerated from "../key_generated"

const KeyGeneratable = AssociationRow => class extends AssociationRow {

  _showKeyGenerated(){
    return this.props.assoc.keyGeneratedAt && this._generatedEnvKey()
  }

  _generatedEnvKey(){
    return this.props.generatedEnvKeysById[this.props.assoc.id]
  }

  _classNames(){
    return super._classNames().concat([
      (this._showKeyGenerated() ? " key-generated" : "")
    ])
  }

  _renderContents(){
    return super._renderContents().concat([
      this._renderKeyGenerated()
    ])
  }

  _renderKeyGenerated(){
    if (this._showKeyGenerated()){
      return h(KeyGenerated, {
        ...this.props,
        ...this.props.assoc,
        ...(this.props.generatedEnvKeysById[this.props.assoc.id] || {}),
        onClose: ()=> this.props.clearGeneratedAssocKey(this.props.assoc.id)
      })
    }
  }
}

export default KeyGeneratable