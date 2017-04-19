import {
  isUpdatingEnv,
  isCreatingEnvEntry
} from 'reducers/ui_reducers'
import {
  createEntry,
  updateEntry,
  removeEntry,
  updateEntryVal,
  UPDATE_ENV_SUCCESS,
  UPDATE_ENV_FAILED
} from 'actions'

const parentId = "parent1",
      createEntryAction = createEntry({entryKey: "TEST_CREATE_ENTRY"}),
      updateEntryAction = updateEntry({entryKey: "TEST_UPDATE_ENTRY"}),
      removeEntryAction = removeEntry({entryKey: "TEST_REMOVE_ENTRY"}),
      updateEntryValAction = updateEntryVal({entryKey: "TEST_UPDATE_ENTRY_VAL", environment: "development"})

describe("isUpdatingEnv", ()=>{

  describe("UPDATE_ENV_FAILED", ()=>{
    describe("with an envs_outdated error response", ()=>{
      test("it should return the existing state", ()=>{
        expect(isUpdatingEnv({
          parent1: {
            TEST_REMOVE_ENTRY: {key: true},
            TEST_UPDATE_ENTRY: {key: true},
            TEST_UPDATE_ENTRY_VAL: {development: true}
          }
        }, {
          type: UPDATE_ENV_FAILED,
          payload: {response: {data: {error: "envs_outdated"}}}
        })).toEqual({
          parent1: {
            TEST_REMOVE_ENTRY: {key: true},
            TEST_UPDATE_ENTRY: {key: true},
            TEST_UPDATE_ENTRY_VAL: {development: true}
          }
        })
      })
    })

    describe("with any other error response", ()=>{
      test("it should update based on pending actions", ()=>{
        expect(isUpdatingEnv({
          parent1: {
            TEST_REMOVE_ENTRY: {key: true},
            TEST_UPDATE_ENTRY: {key: true},
            TEST_UPDATE_ENTRY_VAL: {development: true}
          }
        }, {
          type: UPDATE_ENV_FAILED,
          meta: {parentId, envActionsPending: [updateEntryAction, updateEntryValAction, createEntryAction]}
        })).toEqual({
          parent1: {
            TEST_REMOVE_ENTRY: {key: true},
            TEST_UPDATE_ENTRY: {},
            TEST_UPDATE_ENTRY_VAL: {}
          }
        })
      })
    })
  })

  describe("UPDATE_ENV_SUCCESS", ()=>{
    test("it should update based on pending actions", ()=>{
        expect(isUpdatingEnv({
          parent1: {
            TEST_REMOVE_ENTRY: {key: true},
            TEST_UPDATE_ENTRY: {key: true},
            TEST_UPDATE_ENTRY_VAL: {development: true}
          }
        }, {
          type: UPDATE_ENV_SUCCESS,
          meta: {parentId, envActionsPending: [updateEntryAction, removeEntryAction, createEntryAction]}
        })).toEqual({
          parent1: {
            TEST_REMOVE_ENTRY: {},
            TEST_UPDATE_ENTRY: {},
            TEST_UPDATE_ENTRY_VAL: {development: true}
          }
        })
      })
  })

})

describe("isCreatingEnvEntry", ()=>{

  describe("UPDATE_ENV_FAILED", ()=>{
    describe("with an envs_outdated error response", ()=>{
      test("it should return the existing state", ()=>{
        expect(isCreatingEnvEntry({
          parent1: { TEST_CREATE_ENTRY: true }
        }, {
          type: UPDATE_ENV_FAILED,
          payload: {response: {data: {error: "envs_outdated"}}}
        })).toEqual({
          parent1: { TEST_CREATE_ENTRY: true }
        })
      })
    })

    describe("with any other error response", ()=>{
      test("it should update based on pending actions", ()=>{
        expect(isCreatingEnvEntry({
          parent1: { TEST_CREATE_ENTRY: true }
        }, {
          type: UPDATE_ENV_FAILED,
          meta: {parentId, envActionsPending: [updateEntryAction, createEntryAction]}
        })).toEqual({
          parent1: { }
        })
      })
    })
  })

  describe("UPDATE_ENV_SUCCESS", ()=>{
    test("it should update based on pending actions", ()=>{
        expect(isCreatingEnvEntry({
          parent1: { TEST_CREATE_ENTRY: true }
        }, {
          type: UPDATE_ENV_SUCCESS,
          meta: {parentId, envActionsPending: [updateEntryAction, createEntryAction]}
        })).toEqual({
          parent1: { }
        })
      })
  })
})