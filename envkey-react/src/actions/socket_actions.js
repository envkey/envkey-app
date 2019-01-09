import { createAction } from 'redux-actions'
import { camelizeKeys } from 'xcase'
import R from 'ramda'
import { ActionType } from './action_types'

export const
  socketAction = (type, data) => {
    return createAction(`envkey/SOCKET_${type}`, camelizeKeys)(data)
  },

  socketSubscribeObjectChannel = createAction(ActionType.SOCKET_SUBSCRIBE_OBJECT_CHANNEL),

  socketUserUnsubscribedOrgChannel = createAction(ActionType.SOCKET_USER_UNSUBSCRIBED_ORG_CHANNEL),

  socketUserUnsubscribedObjectChannel = createAction(ActionType.SOCKET_USER_UNSUBSCRIBED_OBJECT_CHANNEL),

  socketUserSubscribedOrgChannel = createAction(ActionType.SOCKET_USER_SUBSCRIBED_ORG_CHANNEL),

  socketUserSubscribedObjectChannel = createAction(ActionType.SOCKET_USER_SUBSCRIBED_OBJECT_CHANNEL),

  socketBroadcastEnvsStatus = createAction(ActionType.SOCKET_BROADCAST_ENVS_STATUS),

  socketUpdateLocalStatus = createAction(ActionType.SOCKET_UPDATE_LOCAL_STATUS),

  socketUnsubscribeAll = createAction(ActionType.SOCKET_UNSUBSCRIBE_ALL),

  processedSocketUpdateEnvStatus = createAction(
    ActionType.PROCESSED_SOCKET_UPDATE_ENVS_STATUS,
    R.prop("status"),
    R.pick(["userId"])
  )