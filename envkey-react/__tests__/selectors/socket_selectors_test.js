import {
  getSocketRemovingEntry,
  getSocketEditingEntry,
  getSocketEditingEntryVal,
  getSocketAddingEntry
} from "selectors"

const
  user1 = {id: "user1", email: "user1@test.com"},
  user2 = {id: "user2", email: "user2@test.com"},
  state = {
    users: {user1, user2},
    socketEnvsStatus: {
      removingEntry: {TEST_1: "user1", TEST_4: "user2"},
      editingEntry: {TEST_2: "user1", TEST_5: "user2"},
      editingEntryVal: {user1: ["TEST_3", "staging"], user2: ["TEST_6", "production"]},
      addingEntry: {user1: true, user2: true}
    }
  }

test("getSocketRemovingEntry", ()=>{
  expect(getSocketRemovingEntry(state)).toEqual({
    TEST_1: user1,
    TEST_4: user2
  })
})

test("getSocketEditingEntry", ()=>{
  expect(getSocketEditingEntry(state)).toEqual({
    TEST_2: user1,
    TEST_5: user2
  })
})

test("getSocketEditingEntryVal", ()=>{
  expect(getSocketEditingEntryVal(state)).toEqual({
    TEST_3: {staging: user1},
    TEST_6: {production: user2}
  })
})

test("getSocketAddingEntry", ()=>{
  expect(getSocketAddingEntry(state)).toEqual([user1, user2])
})
