import { createAction } from 'redux-actions'
import { camelizeKeys } from 'xcase'
import R from 'ramda'
import {
  SOCKET_SUBSCRIBE_OBJECT_CHANNEL,
  BROADCAST_UPDATE_ENVS_STATUS,
  SOCKET_USER_UNSUBSCRIBED_ORG_CHANNEL,
  SOCKET_USER_UNSUBSCRIBED_OBJECT_CHANNEL,
  SOCKET_USER_SUBSCRIBED_ORG_CHANNEL,
  SOCKET_USER_SUBSCRIBED_OBJECT_CHANNEL
} from 'actions'

export const
  socketAction = (type, data) => {
    return createAction(`envkey/SOCKET_${type}`, camelizeKeys)(data)
  },

  socketSubscribeObjectChannel = createAction(SOCKET_SUBSCRIBE_OBJECT_CHANNEL),

  socketUserUnsubscribedOrgChannel = createAction(SOCKET_USER_UNSUBSCRIBED_ORG_CHANNEL),

  socketUserUnsubscribedObjectChannel = createAction(SOCKET_USER_UNSUBSCRIBED_OBJECT_CHANNEL),

  socketUserSubscribedOrgChannel = createAction(SOCKET_USER_SUBSCRIBED_ORG_CHANNEL),

  socketUserSubscribedObjectChannel = createAction(SOCKET_USER_SUBSCRIBED_OBJECT_CHANNEL),

  broadcastUpdateEnvsStatus = createAction(BROADCAST_UPDATE_ENVS_STATUS)