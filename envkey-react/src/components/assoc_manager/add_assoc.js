import React from 'react'
import R from 'ramda'
import h from "lib/ui/hyperscript_with_helpers"
import MultiSelectForm from "components/shared/multi_select_form"

const hasExistingTab = props => props.candidates && props.candidates.length,

      hasNewTab = props => props.addFormType,

      hasTabs = props => hasExistingTab(props) && hasNewTab(props)

export default class AddAssoc extends React.Component {

  constructor(props) {
    super(props)

    if(hasTabs(props)){
      this.state = { selectedTab: "existing" }
    }
  }

  render(){
    return h.div(".add-assoc", {
      className: (hasTabs(this.props) ? "has-tabs" : "")
    }, [
      this._renderTabs(),
      this._renderContainer()
    ])
  }

  _renderTabs(){
    if(hasTabs(this.props)){
      return h.div(".tabs", [
        h.div(".tab", {
          className: (this.state.selectedTab == "existing" ? "selected " : ""),
          onClick: e => this.setState({selectedTab: "existing"})
        },[
          h.span(this.props.addExistingLabel)
        ]),

        h.div(".tab", {
          className: (this.state.selectedTab == "new" ? "selected " : ""),
          onClick: e => this.setState({selectedTab: "new"})
        },[
          h.span(this.props.addNewLabel)
        ])
      ])
    }
  }

  _renderContainer(){
    if(hasTabs(this.props)){
      if(this.state.selectedTab == "existing"){
        return this._renderExisting()
      } else if (this.state.selectedTab == "new"){
        return this._renderNew()
      }
    } else if (hasExistingTab(this.props)) {
      return this._renderExisting()
    } else if (hasNewTab(this.props)){
      return this._renderNew()
    }
  }

  _renderNew(){
    return h(this.props.addFormType, {
      ...R.pick(["role", "orgRolesAssignable", "orgRolesInvitable"], this.props),
      addAssoc: true,
      isSubmitting: this.props.isCreating,
      onSubmit: attr => this.props.createAssoc(attr, this.props.role)
    })
  }

  _renderExisting(){
    return h(MultiSelectForm, {
      items: this.props.candidates.map(assoc => {
        const text = this.props.addExistingTextFn(assoc),
              label = this.props.addExistingLabelFn ? this.props.addExistingLabelFn(assoc) : text
        return {
          id: assoc.id,
          text,
          label
        }
      }),
      isSubmitting: this.props.isAddingAssoc,
      submitLabelFn: this.props.addExistingSubmitLabelFn,
      placeholder: "Type here to filter...",
      onSubmit: ids => this.props.addAssoc({ids, role: this.props.role})
    })
  }
}