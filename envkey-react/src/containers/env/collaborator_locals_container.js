import React from 'react'
import {Link} from 'react-router'
import { connect } from 'react-redux'
import R from 'ramda'
import {
  getCurrentUser,
  getCurrentOrg,
  getAppBySlug,
  getUserBySlug,
  getAppUserBy
} from 'selectors'
import { selectedObject } from 'actions'
import {
  CollaboratorLocalsContainer,
  EnvManagerContainerFactory
} from 'containers'

const triggerSelected = (props)=> {
        if(props.decryptedAll && props.appUser){
          props.selected(props.appUser)
        }
      }

class CollaboratorLocals extends React.Component {

  constructor(props){
      super(props)
      triggerSelected(props)
    }

  componentWillReceiveProps(nextProps){
    if (this.props.appUser.id != nextProps.appUser.id){
      triggerSelected(nextProps)
    } else if (!this.props.decryptedAll && nextProps.decryptedAll){
      triggerSelected(nextProps)
    }
  }

  render(){
    return <div className="collaborator-locals">
      {this._renderHeader()}
      {this._renderEnvManager()}
    </div>
  }

  _renderHeader(){
    const {user: {firstName, lastName, email},
           params: {orgSlug, slug: appSlug}} = this.props

    return <header>
      <Link className="back-link"
            to={`/${orgSlug}/apps/${appSlug}/collaborators`}>
         <span className="img">←</span>
         <span>Back To Collaborators</span>
      </Link>
      <h2>{firstName} {lastName} {`<${email}>`} Local Overrides</h2>
    </header>
  }

  _renderEnvManager(){
    const EnvManagerContainer = EnvManagerContainerFactory({parentType: "appUser"})

    return <div className="locals-env-manager">
      <EnvManagerContainer {...this.props} />
    </div>
  }

}

const
  mapStateToProps = (state, ownProps) => {
    const appSlug = ownProps.params.slug,
          userSlug = ownProps.params.userSlug,
          app = getAppBySlug(appSlug, state),
          user = getUserBySlug(userSlug, state),
          appUser = getAppUserBy({appId: app.id, userId: user.id}, state)

    return {
      currentUser: getCurrentUser(state),
      app,
      user,
      appUser
    }
  },

  mapDispatchToProps = (dispatch, ownProps) => {
    return {
      selected: appUser => dispatch(selectedObject({...appUser, objectType: "appUser"}))
    }
  }

export default connect(mapStateToProps, mapDispatchToProps)(CollaboratorLocals)