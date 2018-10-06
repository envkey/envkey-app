import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import SmallLoader from 'components/shared/small_loader'
import BasicRenameForm from '../shared/basic_rename_form'
import DeleteField from '../shared/delete_field'

const label = "Block"

export default class AppSettingsForm extends React.Component {

  constructor(props){
    super(props)

    this.state = {
      autoCaps: props.configBlock.autoCaps
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.configBlock.id != this.props.configBlock.id){
      this.setState({autoCaps: nextProps.configBlock.autoCaps})
    }
  }

  _onSettingsSubmit(e){
    if(e)e.preventDefault()
    this.props.onUpdateSettings(R.pick(["autoCaps"], this.state))
  }

  _onAutoCapsChange(){
    this.setState({autoCaps: !this.state.autoCaps}, ::this._onSettingsSubmit)
  }

  render(){
    return h.div(".block-settings", [
      this._renderRename(),
      this._renderSettings(),
      this._renderDangerZone()
    ])
  }

  _renderRename(){
    const {configBlock, isRenaming, onRename, onUpdateSettings} = this.props
    return h(BasicRenameForm, {label, isRenaming, onRename, name: configBlock.name})
  }

  _renderSettings(){
    return h.form(".object-form.auto-submit", {onSubmit: ::this._onSettingsSubmit}, [

      h.fieldset(".checkbox", [
        h.label([
          h.span("Auto-Upcase variable names"),
          h.input({type: "checkbox", checked: this.state.autoCaps, onChange: ::this._onAutoCapsChange})
        ])
      ]),

      this._renderSettingsSubmit()
    ])
  }

  _renderSettingsSubmit(){
    if(this.props.isUpdatingSettings){
      return h(SmallLoader)
    }
  }

  _renderDangerZone(){
    const {configBlock, isRemoving, onRemove} = this.props

    if (configBlock.permissions.delete){
      return h.div(".danger-zone", [
        h.h3("Danger Zone"),
        h.div(".content", [
          h.fieldset(".delete-block", [
            h.label("Delete Block"),
            h(DeleteField, {label, isRemoving, onRemove, confirmName: configBlock.name})
          ])
        ])
      ])
    }
  }
}