import {
  anonymizeEnvStatus,
  deanonymizeEnvStatus,
  statusKeysToArrays
} from 'lib/env/update_status'

const entries = ["TEST_1", "TEST_2", "TEST_3", "TEST_4", "TEST_5", "TEST_6"],
      environments = ["development", "staging", "production"],
      subEnvs = ["subEnv1", "subEnv2"]

test("deanonymizeEnvStatus", ()=>{
  expect(deanonymizeEnvStatus({
    "env-update-id": {
      removingEntry: [[0, -1]],
      editingEntry: [[1, 0]],
      editingEntryVal: [[2,1]],
    },
    "next-update-id": {
      removingEntry: [[3, -1]],
      editingEntry: [[4, 1]],
      editingEntryVal: [[5,2]],
      addingEntry: [-1]
    }
  }, entries, environments, subEnvs)).toEqual({
    "env-update-id": {
      removingEntry: [["TEST_1", "@@__base__"]],
      editingEntry: [["TEST_2", "subEnv1"]],
      editingEntryVal: [["TEST_3","staging"]],
    },
    "next-update-id": {
      removingEntry: [["TEST_4", "@@__base__"]],
      editingEntry: [["TEST_5", "subEnv2"]],
      editingEntryVal: [["TEST_6","production"]],
      addingEntry: ["@@__base__"]
    }
  })
})

test("anonymizeEnvStatus", ()=>{
  expect(anonymizeEnvStatus({
    "env-update-id": {
      removingEntry: [["TEST_1", "@@__base__"]],
      editingEntry: [["TEST_2", "subEnv1"]],
      editingEntryVal: [["TEST_3","staging"]],
    },
    "next-update-id": {
      removingEntry: [["TEST_4", "@@__base__"]],
      editingEntry: [["TEST_5", "subEnv2"]],
      editingEntryVal: [["TEST_6","production"]],
      addingEntry: ["@@__base__"]
    }
  }, entries, environments, subEnvs)).toEqual({
    "env-update-id": {
      removingEntry: [[0, -1]],
      editingEntry: [[1, 0]],
      editingEntryVal: [[2,1]],
    },
    "next-update-id": {
      removingEntry: [[3, -1]],
      editingEntry: [[4, 1]],
      editingEntryVal: [[5,2]],
      addingEntry: [-1]
    }
  })
})

test("statusKeysToArrays", ()=>{
  expect(statusKeysToArrays({
    removingEntry: {TEST_4: {["@@__base__"]: true}},
    editingEntry: {TEST_5: {subEnv1: true}},
    editingEntryVal: {TEST_6: {production: true, staging: true}, TEST_7: {development: true}},
    addingEntry: "subEnv2"
  })).toEqual({
    removingEntry: [["TEST_4", "@@__base__"]],
    editingEntry: [["TEST_5", "subEnv1"]],
    editingEntryVal: [["TEST_6", "production"], ["TEST_6", "staging"], ["TEST_7", "development"]],
    addingEntry: ["subEnv2"]
  })
})

