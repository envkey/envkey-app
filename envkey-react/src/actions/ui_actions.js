import R from 'ramda'
import { createAction } from 'redux-actions'
import {
  APP_LOADED,
  RESET_VERIFY_EMAIL,
  START_DEMO,
  SET_DEMO_DOWNLOAD_URL,
  GENERATE_DEMO_ORG_REQUEST,
  CLEAR_GENERATED_ASSOC_KEY,
  CLOSE_GENERATED_INVITE_LINK,
  SELECTED_OBJECT
} from './action_types'

export const
  appLoaded = createAction(APP_LOADED),

  startDemo = createAction(START_DEMO),

  setDemoDownloadUrl = createAction(SET_DEMO_DOWNLOAD_URL),

  generateDemoOrg = createAction(GENERATE_DEMO_ORG_REQUEST),

  clearGeneratedAssocKey = createAction(CLEAR_GENERATED_ASSOC_KEY),

  closeGeneratedInviteLink = createAction(CLOSE_GENERATED_INVITE_LINK, R.always({}), R.pick(["parentId"])),

  selectedObject = createAction(SELECTED_OBJECT)


