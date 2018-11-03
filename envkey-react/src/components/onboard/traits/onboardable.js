import React from 'react'
import h from "lib/ui/hyperscript_with_helpers"

const Onboardable = (Component, OnboardSlider, {
  startedOnboardingFn,
  finishedOnboardingFn,
  selectedIndexFn
}) => class extends Component {

  constructor(props){
    super(props)
    this.state = this.state || {}

    this.state.startedOnboarding = props.isOnboarding &&
                                   props.parent &&
                                   props.parent.decrypted &&
                                   startedOnboardingFn(props, this.state)

    this.state.finishedOnboarding = props.isOnboarding &&
                                    props.parent &&
                                    props.parent.decrypted &&
                                    finishedOnboardingFn(props, this.state)

  }


  componentWillReceiveProps(nextProps) {
    if (super.componentWillReceiveProps) {
      super.componentWillReceiveProps(nextProps)
    }

    if (!nextProps.parent)return

    if (this.props.parent.id != nextProps.parent.id){
      this.setState({startedOnboarding: false, finishedOnboarding: false})
    }

    if (nextProps.isOnboarding && nextProps.parent.decrypted){

      if (startedOnboardingFn(nextProps, this.state)){
        this.setState({startedOnboarding: true})
      }

      if (finishedOnboardingFn(nextProps, this.state)){
        this.setState({finishedOnboarding: true})
      }
    }
  }

  _classNames(){
    const classNames = super._classNames ? super._classNames() : []
    return classNames.concat([
      (this.state.startedOnboarding ? "is-onboarding" : "")
    ])
  }

  _renderContents(){
    return super._renderContents().concat([this._renderOnboard()])
  }

  _renderOnboard(){
    if (this.state.startedOnboarding){
      return h(OnboardSlider, {...this.props, selectedIndex: selectedIndexFn(this.props, this.state)})
    }
  }
}

export default Onboardable

