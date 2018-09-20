import React from 'react'
import R from 'ramda'
import { connect } from 'react-redux'
import { startDemo, generateDemoOrg, setDemoDownloadUrl } from 'actions'
import {OnboardOverlay} from 'components/onboard'
import Spinner from 'components/shared/spinner'

class DemoLoginContainer extends React.Component {

  componentDidMount() {
    if (this.props.params.bs64props){
      const loginParams = R.pipe(
        atob,
        escape,
        decodeURIComponent,
        JSON.parse
      )(this.props.params.bs64props)

      this.props.startDemo(loginParams)
    } else {
      const downloadUrl = R.path(["location", "query", "download"], this.props)

      if (downloadUrl){
        this.props.setDemoDownloadUrl(decodeURIComponent(downloadUrl))
      }

      this.props.generateDemoOrg()
    }
  }

  render(){
    return <OnboardOverlay className="demo-overlay">
      <div>
        <div className="onboard-auth-form">
          <h1>Generating <em>Demo Org</em></h1>
          <form> <Spinner /> </form>
        </div>
      </div>
    </OnboardOverlay>
  }

}

const mapDispatchToProps = dispatch => {
  return {
    setDemoDownloadUrl: url => dispatch(setDemoDownloadUrl(url)),
    generateDemoOrg: ()=> dispatch(generateDemoOrg()),
    startDemo: p => dispatch(startDemo(p))
  }
}

export default connect(R.always({}), mapDispatchToProps)(DemoLoginContainer)