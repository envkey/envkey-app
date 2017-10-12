import {
  getSocketRemovingEntry,
  getSocketEditingEntry,
  getSocketEditingEntryVal,
  getSocketAddingEntry,
  getAnonSocketEnvsStatus,
  getSocketEnvsStatus
} from "selectors"

describe("socket status selectors", ()=>{
  const
    user1 = {id: "user1", email: "user1@test.com"},
    user2 = {id: "user2", email: "user2@test.com"},
    state = {
      users: {user1, user2},
      socketEnvsStatus: {
        user1: {
          "user1-env-update-id": {
            removingEntry: [["TEST_1", "@@__base__"]],
            editingEntry: [["TEST_2", "subEnv1"]],
            editingEntryVal: [["TEST_3","staging"]],
          },
          "user-1-next-update-id": {
            removingEntry: [["TEST_4", "@@__base__"]],
            editingEntry: [["TEST_5", "subEnv2"]],
            editingEntryVal: [["TEST_6","production"]],
            addingEntry: ["@@__base__"]
          }
        },

        user2: {
          "user2-env-update-id": {
            removingEntry: [["TEST_7", "@@__base__"]],
            editingEntry: [["TEST_8", "subEnv1"]],
            editingEntryVal: [["TEST_3","development"], ["TEST_9", "staging"]],
          },
          "user2-next-update-id": {
            removingEntry: [["TEST_10", "@@__base__"]],
            editingEntry: [["TEST_11", "subEnv3"]],
            editingEntryVal: [["TEST_6","development"], ["TEST_12", "production"]],
            addingEntry: ["subEnv3"]
          }
        }
      }
    }

  test("getSocketRemovingEntry", ()=>{
    expect(getSocketRemovingEntry(state)).toEqual({
      TEST_1: {"@@__base__": user1},
      TEST_4: {"@@__base__": user1},
      TEST_7: {"@@__base__": user2},
      TEST_10: {"@@__base__": user2}
    })
  })

  test("getSocketEditingEntry", ()=>{
    expect(getSocketEditingEntry(state)).toEqual({
      TEST_2: {subEnv1: user1},
      TEST_5: {subEnv2: user1},
      TEST_8: {subEnv1: user2},
      TEST_11: {subEnv3: user2}
    })
  })

  test("getSocketEditingEntryVal", ()=>{
    expect(getSocketEditingEntryVal(state)).toEqual({
      TEST_3: {staging: user1, development: user2},
      TEST_6: {production: user1, development: user2},
      TEST_9: {staging: user2},
      TEST_12: {production: user2}
    })
  })

  test("getSocketAddingEntry", ()=>{
    expect(getSocketAddingEntry(state)).toEqual({
      "@@__base__": [user1],
      "subEnv3": [user2]
    })
  })
})

describe("getAnonSocketEnvsStatus", ()=>{
  const
    env = {TEST_1: {val: "test", inherits: null},
           TEST_2: {val: "test", inherits: null},
           TEST_3: {val: "test", inherits: null},
           TEST_4: {val: "test", inherits: null},
           TEST_5: {val: "test", inherits: null},
           TEST_6: {val: "test", inherits: null}},
    baseState = {
      selectedObjectId: "app-id",
      selectedObjectType: "app",
      auth: {id: "user-id"},
      apps: { "app-id": {
        id: "app-id",
        envsWithMeta: { development: env, staging: env, production: env,}
      }},
      users: {"user-id": {id: "user-id"}},
      appUsers: {
        "app-user-id": {
          appId: "app-id",
          userId: "user-id",
          environmentsAccessible: ["development", "staging", "production"]
        }
      },
      envUpdateId: {"app-id": "env-update-id"}
    }

  it("accumulates correctly with a single envUpdateId", ()=>{
    expect(getAnonSocketEnvsStatus({
      ...baseState,
      localSocketEnvsStatus: {
        removingEntry: {TEST_4: {"@@__base__": true}},
        editingEntry: {TEST_5: {"@@__base__": true}},
        editingEntryVal: {TEST_6: {production: true}},
        addingEntry: "@@__base__"
      },
      pendingLocalSocketEnvsStatus: {
        "env-update-id": {
          removingEntry: {TEST_1: {"@@__base__": true}},
          editingEntry: {TEST_2: {"@@__base__": true}},
          editingEntryVal: {TEST_3: {staging: true}}
        }
      }
    })).toEqual({
      "env-update-id": {
        removingEntry: [[3,-1], [0,-1]],
        editingEntry: [[4,-1], [1, -1]],
        editingEntryVal: [[5,2],[2,1]],
        addingEntry: [-1]
      }
    })
  })

  it("accumulates correctly with multiple envUpdateIds", ()=>{
    expect(getAnonSocketEnvsStatus({
      ...baseState,
      envUpdateId: {"app-id":"next-update-id"},
      localSocketEnvsStatus: {
        editingEntry: {TEST_5: {"@@__base__": true}},
        editingEntryVal: {TEST_6: {production: true}}
      },
      pendingLocalSocketEnvsStatus: {
        "env-update-id": {
          removingEntry: {TEST_1: {"@@__base__": true}},
          editingEntry: {TEST_2: {"@@__base__": true}},
          editingEntryVal: {TEST_3: {staging: true}}
        },
        "next-update-id": {
          removingEntry: {TEST_4: {"@@__base__": true}},
          addingEntry: "@@__base__"
        }
      }
    })).toEqual({
      "env-update-id": {
        removingEntry: [[0, -1]],
        editingEntry: [[1, -1]],
        editingEntryVal: [[2,1]],
      },
      "next-update-id": {
        removingEntry: [[3, -1]],
        editingEntry: [[4, -1]],
        editingEntryVal: [[5,2]],
        addingEntry: [-1]
      }
    })
  })


})