import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import Flashable from 'components/shared/traits/flashable'
import SmallLoader from 'components/shared/small_loader'
import { imagePath } from 'lib/ui'

const assocId = props => R.path(["relation", "id"], props.assoc) || props.assoc.id,

      canRemove = ({assoc}) => assoc.relation ? Boolean(assoc.relation.permissions.delete) :
                                                Boolean(assoc.permissions.delete),

      isRemoving = props => props.isRemovingFn(assocId(props)),

      isGeneratingAssocKey = props => props.isGeneratingAssocKeyFn(assocId(props))

class AssocRow extends React.Component{

  _onRemove(){
    this.props.removeAssoc(assocId(this.props))
  }

  _onRenew(){
    this.props.generateKey(assocId(this.props))
  }

  render(){
    return h.div(".association-row", {
      className: (canRemove(this.props) ? "deletable" : "")
    }, [
      this._renderRemove(),
      h(this.props.rowDisplayType, {
        ...this.props,
        onRenew: ::this._onRenew,
        isRemoving: isRemoving(this.props),
        isGeneratingAssocKey: isGeneratingAssocKey(this.props)
      }),
      this._renderFlash()
    ])
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

export default Flashable(AssocRow)