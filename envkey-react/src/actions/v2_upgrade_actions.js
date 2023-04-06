import { createAction } from 'redux-actions'
import R from 'ramda'
import {
  START_V2_UPGRADE,
  CANCEL_V2_UPGRADE,
  FINISH_V2_UPGRADE,
  CHECK_V2_CORE_PROC_ALIVE,
  V2_WAIT_FOR_CORE_PROC_ALIVE,
  V2_UPGRADE_ACCEPT_INVITE,
  CLEARED_V2_UPGRADE_OVERLAY
} from './action_types'

export const
  startV2Upgrade = createAction(START_V2_UPGRADE),
  cancelV2Upgrade = createAction(CANCEL_V2_UPGRADE),
  finishV2Upgrade = createAction(FINISH_V2_UPGRADE),
  waitForV2CoreProcAlive = createAction(V2_WAIT_FOR_CORE_PROC_ALIVE),
  acceptV2UpgradeInvite = createAction(V2_UPGRADE_ACCEPT_INVITE),
  clearedV2UpgradeOverlay = createAction(CLEARED_V2_UPGRADE_OVERLAY)

