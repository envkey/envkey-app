import {
  socketEnvsStatus
} from 'reducers/socket_reducers'
import {
  PROCESSED_SOCKET_UPDATE_ENVS,
  SOCKET_USER_UNSUBSCRIBED_OBJECT_CHANNEL,
  PROCESSED_SOCKET_UPDATE_ENVS_STATUS,

  FETCH_OBJECT_DETAILS_SUCCESS,
  FETCH_OBJECT_DETAILS_FAILED
} from 'actions'

describe("socketEnvsStatus", ()=>{

  describe("PROCESSED_SOCKET_UPDATE_ENVS_STATUS", ()=>{

    it("should correctly transform user update statuses", ()=>{
      expect(socketEnvsStatus(undefined, {type: PROCESSED_SOCKET_UPDATE_ENVS_STATUS, payload: {
        userId: "user1",
        removingEntry: "TEST_1",
        editingEntry: "TEST_2",
        editingEntryVal: ["TEST_3", "staging"],
        addingEntry: true
      }})).toEqual({
        removingEntry: {TEST_1: "user1"},
        editingEntry: {TEST_2: "user1"},
        editingEntryVal: {user1: ["TEST_3", "staging"]},
        addingEntry: {user1: true}
      })
    })

    it("should accumulate additional statuses", ()=>{
      expect(socketEnvsStatus({
        removingEntry: {TEST_1: "user1"},
        editingEntry: {TEST_2: "user1"},
        editingEntryVal: {user1: ["TEST_3", "staging"]},
        addingEntry: {user1: true}
      }, {type: PROCESSED_SOCKET_UPDATE_ENVS_STATUS, payload: {
        userId: "user2",
        removingEntry: "TEST_4",
        editingEntry: "TEST_5",
        editingEntryVal: ["TEST_6", "production"],
        addingEntry: true
      }})).toEqual({
        removingEntry: {TEST_1: "user1", TEST_4: "user2"},
        editingEntry: {TEST_2: "user1", TEST_5: "user2"},
        editingEntryVal: {user1: ["TEST_3", "staging"], user2: ["TEST_6", "production"]},
        addingEntry: {user1: true, user2: true}
      })
    })

    it("should remove statuses when key is false", ()=>{
      expect(socketEnvsStatus({
        removingEntry: {TEST_1: "user1", TEST_4: "user2"},
        editingEntry: {TEST_2: "user1", TEST_5: "user2"},
        editingEntryVal: {user1: ["TEST_3", "staging"], user2: ["TEST_6", "production"]},
        addingEntry: {user1: true, user2: true}
      }, {type: PROCESSED_SOCKET_UPDATE_ENVS_STATUS, payload: {
        userId: "user2",
        removingEntry: false,
        editingEntry: false,
        editingEntryVal: false,
        addingEntry: false
      }})).toEqual({
        removingEntry: {TEST_1: "user1"},
        editingEntry: {TEST_2: "user1"},
        editingEntryVal: {user1: ["TEST_3", "staging"]},
        addingEntry: {user1: true}
      })
    })

    it("should only allow a single editingEntry key per user", ()=>{
      expect(socketEnvsStatus({
        editingEntry: {TEST_2: "user1"},
      }, {type: PROCESSED_SOCKET_UPDATE_ENVS_STATUS, payload: {
        userId: "user1",
        editingEntry: "TEST_4",
      }})).toEqual({
        editingEntry: {TEST_4: "user1"},
      })
    })

  })

  describe("SOCKET_USER_UNSUBSCRIBED_OBJECT_CHANNEL", ()=>{

    it("should remove the user's statuses", ()=>{
      expect(socketEnvsStatus({
        removingEntry: {TEST_1: "user1", TEST_4: "user2"},
        editingEntry: {TEST_2: "user1", TEST_5: "user2"},
        editingEntryVal: {user1: ["TEST_3", "staging"], user2: ["TEST_6", "production"]},
        addingEntry: {user1: true, user2: true}
      }, {type: SOCKET_USER_UNSUBSCRIBED_OBJECT_CHANNEL, payload: {userId: "user2"}})).toEqual({
        removingEntry: {TEST_1: "user1"},
        editingEntry: {TEST_2: "user1"},
        editingEntryVal: {user1: ["TEST_3", "staging"]},
        addingEntry: {user1: true}
      })
    })

  })




})