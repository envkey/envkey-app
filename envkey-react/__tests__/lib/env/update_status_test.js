import {processSocketUpdateEnvStatus} from 'lib/env/update_status'

describe("processSocketUpdateEnvStatus", ()=>{

  const entries = ["TEST_1", "TEST_2", "TEST_3"],
        environments = ["development", "staging", "production"],
        userId = "user-id"

  it("should convert indices to entries/environments", ()=>{
    expect(processSocketUpdateEnvStatus({
      userId,
      removingEntry: 1,
      editingEntry: 2,
      editingEntryVal: [0, 1]
    }, entries, environments)).toEqual({
      userId,
      removingEntry: "TEST_2",
      editingEntry: "TEST_3",
      editingEntryVal: ["TEST_1", "staging"]
    })
  })

  it("should handle true/false values appropriately", ()=>{
    expect(processSocketUpdateEnvStatus({
      userId,
      removingEntry: false,
      editingEntry: false,
      editingEntryVal: false,
      addingEntry: true
    }, entries, environments)).toEqual({
      userId,
      removingEntry: false,
      editingEntry: false,
      editingEntryVal: false,
      addingEntry: true
    })

    expect(processSocketUpdateEnvStatus({
      userId,
      addingEntry: true
    }, entries, environments)).toEqual({
      userId,
      addingEntry: true
    })
  })
})