import React from "react"
import ReactDOM from "react-dom"
import {imagePath} from 'lib/ui'
import Changelog from 'components/about/changelog'

class MainUpdater extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      versionDownloaded: null
    }
  }

  componentDidMount(){
    window.ipc.on('version-downloaded', (sender, versionDownloaded) =>{
      this.setState({versionDownloaded}, ()=> {
        window.ipc.send("main-updater-version-received")
      })
    })
  }

  _onClose(){
    window.ipc.send("main-updater-closed")
  }

  _onUpdate(){
   window.ipc.send("main-updater-restart")
  }

  render(){
    return <div className="main-updater">
      <header>
        <div className="logo">
          <img src={imagePath("envkey-logo.svg")} />
        </div>
      </header>

      <section className="update-info">
        <h1>Update <em>Downloaded</em></h1>
        <p>EnvKey has auto-updated to <strong>{this.state.versionDownloaded}</strong>. Restart with the latest version?</p>

        <div className="changelog-container">
          {this._renderChangelog()}
        </div>

        <div className="actions">
          <button className="close" onClick={::this._onClose}>Not Now</button>
          <button className="update" onClick={::this._onUpdate}>Restart</button>
        </div>

      </section>

    </div>
  }

  _renderChangelog(){
    return <Changelog version={this.state.versionDownloaded} />
  }
}

ReactDOM.render(<MainUpdater />, document.getElementById('root'))


