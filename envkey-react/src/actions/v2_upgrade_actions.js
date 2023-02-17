import { createAction } from 'redux-actions'
import R from 'ramda'
import {
  START_V2_UPGRADE,
  START_V2_UPGRADE_REQUEST,
  CANCEL_V2_UPGRADE,
  CANCEL_V2_UPGRADE_REQUEST,
  FINISH_V2_UPGRADE,
  FINISH_V2_UPGRADE_REQUEST,
  CHECK_V2_CORE_PROC_ALIVE,
  V2_WAIT_FOR_CORE_PROC_ALIVE,
  V2_UPGRADE_ACCEPT_INVITE
} from './action_types'

export const
  startV2Upgrade = createAction(START_V2_UPGRADE),
  startV2UpgradeRequest = createAction(START_V2_UPGRADE_REQUEST),
  cancelV2Upgrade = createAction(CANCEL_V2_UPGRADE),
  cancelV2UpgradeRequest = createAction(CANCEL_V2_UPGRADE_REQUEST),
  finishV2Upgrade = createAction(FINISH_V2_UPGRADE),
  finishV2UpgradeRequest = createAction(FINISH_V2_UPGRADE_REQUEST),
  waitForV2CoreProcAlive = createAction(V2_WAIT_FOR_CORE_PROC_ALIVE),
  acceptV2UpgradeInvite = createAction(V2_UPGRADE_ACCEPT_INVITE)

