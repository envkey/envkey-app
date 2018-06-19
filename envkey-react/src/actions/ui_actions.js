import R from 'ramda'
import { createAction } from 'redux-actions'
import {
  APP_LOADED,
  RESET_VERIFY_EMAIL,
  START_DEMO,
  SET_DEMO_DOWNLOAD_URL,
  GENERATE_DEMO_ORG_REQUEST,
  CLOSE_GENERATED_INVITE_LINK,
  SELECTED_OBJECT
} from './action_types'

export const
  appLoaded = createAction(APP_LOADED),

  startDemo = createAction(START_DEMO),

  setDemoDownloadUrl = createAction(SET_DEMO_DOWNLOAD_URL),

  generateDemoOrg = createAction(GENERATE_DEMO_ORG_REQUEST),

  closeGeneratedInviteLink = createAction(CLOSE_GENERATED_INVITE_LINK, R.always({}), R.pick(["parentId"])),

  selectedObject = createAction(SELECTED_OBJECT)


