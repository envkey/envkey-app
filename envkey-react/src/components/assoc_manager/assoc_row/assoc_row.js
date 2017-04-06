import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import SmallLoader from 'components/shared/small_loader'
import KeyGeneratable from './traits/key_generatable'
import { imagePath } from 'lib/ui'

const targetId = props => R.path(["relation", "id"], props.assoc) || props.assoc.id,

      canRemove = ({assoc}) => assoc.relation ? Boolean(assoc.relation.permissions.delete) :
                                                Boolean(assoc.permissions.delete),

      isRemoving = props => props.isRemovingById[targetId(props)] || false,

      isGeneratingAssocKey = props => props.isGeneratingAssocKeyById[targetId(props)] || false,

      isGrantingEnvAccess = ({
        isGrantingEnvAccessByUserId,
        parent: {id: parentId},
        assoc: {id: assocId}
      })=> isGrantingEnvAccessByUserId[assocId] || isGrantingEnvAccessByUserId[parentId] || false

class AssocRow extends React.Component{

  _onRemove(){
    this.props.removeAssoc({targetId: targetId(this.props), assocId: this.props.assoc.id})
  }

  _onRenew(){
    this.props.generateKey(targetId(this.props))
  }

  _classNames(){
    return [
      "association-row",
      (canRemove(this.props) ? " deletable" : ""),
      (isGeneratingAssocKey(this.props) ? " generating-key": "")
    ]
  }

  render(){
    return h.div({className: this._classNames().join(" ")}, this._renderContents())
  }

  _renderContents(){
    return [
      this._renderRemove(),
      h(this.props.rowDisplayType, {
        ...this.props,
        isRemoving: isRemoving(this.props),
        isGeneratingAssocKey: isGeneratingAssocKey(this.props),
        isGrantingEnvAccess: isGrantingEnvAccess(this.props),
        onRenew: ::this._onRenew
      })
    ]
  }

  _renderRemove(){
    if(canRemove(this.props)){
      return h.span(".remove", {
        onClick: ::this._onRemove
      },[
        isRemoving(this.props) ? h(SmallLoader) :
                                 h.img({src: imagePath("remove-circle-black.png")})
      ])
    }
  }
}

export default KeyGeneratable(AssocRow)