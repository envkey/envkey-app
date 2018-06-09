import {
  APP_LOADED,
  RESET_VERIFY_EMAIL,
  START_DEMO,
  SET_DEMO_DOWNLOAD_URL,
  RESET_SESSION,
  GENERATE_DEMO_ORG_REQUEST,
  CLEAR_GENERATED_ASSOC_KEY,
  SELECTED_OBJECT
} from './action_types'

export const
  startDemo = createAction(START_DEMO),

  setDemoDownloadUrl = createAction(SET_DEMO_DOWNLOAD_URL),

  resetSession = createAction(RESET_SESSION),

  generateDemoOrg = createAction(GENERATE_DEMO_ORG_REQUEST),

  clearGeneratedAssocKey = createAction(CLEAR_GENERATED_ASSOC_KEY),

  selectedObject = createAction(SELECTED_OBJECT)


