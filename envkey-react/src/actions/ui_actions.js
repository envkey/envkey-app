import R from 'ramda'
import { createAction } from 'redux-actions'
import { ActionType } from './action_types'

export const
  appLoaded = createAction(ActionType.APP_LOADED),

  startDemo = createAction(ActionType.START_DEMO),

  setDemoDownloadUrl = createAction(ActionType.SET_DEMO_DOWNLOAD_URL),

  generateDemoOrg = createAction(ActionType.GENERATE_DEMO_ORG_REQUEST),

  closeGeneratedInviteLink = createAction(ActionType.CLOSE_GENERATED_INVITE_LINK, R.always({}), R.pick(["parentId"])),

  selectedObject = createAction(ActionType.SELECTED_OBJECT),

  updateVersionFilters = createAction(ActionType.UPDATE_VERSION_FILTERS)



