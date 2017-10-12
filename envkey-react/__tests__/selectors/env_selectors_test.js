import {
  getSubEnvs
} from "selectors"

describe("subenv selectors", ()=>{
  const state = {
    apps: {
      appId: {
        envsWithMeta: {
          development: {
            KEY: "val",
            "@@__sub__": { sub1: {}, sub2: {}, sub99: {}}
          },
          staging: {
            KEY: "val"
          },
          production: {
            KEY: "val",
            "@@__sub__": { sub3: {}}
          },
          productionMetaOnly: {
            KEY: "val",
            "@@__sub__": { sub3: {}}
          }
        }
      }
    }
  }

  test("getSubEnvs", ()=>{
    expect(getSubEnvs("appId",state)).toEqual([
      "sub1", "sub2", "sub3", "sub99"
    ])
  })

})