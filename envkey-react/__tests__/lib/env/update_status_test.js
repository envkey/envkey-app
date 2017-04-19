import {
  anonymizeEnvStatus,
  deanonymizeEnvStatus,
  statusKeysToArrays
} from 'lib/env/update_status'

const entries = ["TEST_1", "TEST_2", "TEST_3", "TEST_4", "TEST_5", "TEST_6"],
      environments = ["development", "staging", "production"]

test("deanonymizeEnvStatus", ()=>{
  expect(deanonymizeEnvStatus({
    "env-update-id": {
      removingEntry: [0],
      editingEntry: [1],
      editingEntryVal: [[2,1]],
    },
    "next-update-id": {
      removingEntry: [3],
      editingEntry: [4],
      editingEntryVal: [[5,2]],
      addingEntry: true
    }
  }, entries, environments)).toEqual({
    "env-update-id": {
      removingEntry: ["TEST_1"],
      editingEntry: ["TEST_2"],
      editingEntryVal: [["TEST_3","staging"]],
    },
    "next-update-id": {
      removingEntry: ["TEST_4"],
      editingEntry: ["TEST_5"],
      editingEntryVal: [["TEST_6","production"]],
      addingEntry: true
    }
  })
})

test("anonymizeEnvStatus", ()=>{
  expect(anonymizeEnvStatus({
    "env-update-id": {
      removingEntry: ["TEST_1"],
      editingEntry: ["TEST_2"],
      editingEntryVal: [["TEST_3","staging"]],
    },
    "next-update-id": {
      removingEntry: ["TEST_4"],
      editingEntry: ["TEST_5"],
      editingEntryVal: [["TEST_6","production"]],
      addingEntry: true
    }
  }, entries, environments)).toEqual({
    "env-update-id": {
      removingEntry: [0],
      editingEntry: [1],
      editingEntryVal: [[2,1]],
    },
    "next-update-id": {
      removingEntry: [3],
      editingEntry: [4],
      editingEntryVal: [[5,2]],
      addingEntry: true
    }
  })
})

test("statusKeysToArrays", ()=>{
  expect(statusKeysToArrays({
    removingEntry: {TEST_4: true},
    editingEntry: {TEST_5: true},
    editingEntryVal: {TEST_6: {production: true, staging: true}, TEST_7: {development: true}},
    addingEntry: true
  })).toEqual({
    removingEntry: ["TEST_4"],
    editingEntry: ["TEST_5"],
    editingEntryVal: [["TEST_6", "production"], ["TEST_6", "staging"], ["TEST_7", "development"]],
    addingEntry: true
  })
})

