import {productionInheritanceOverrides} from 'lib/env/inheritance'

test("productionInheritanceOverrides", ()=>{
  expect(productionInheritanceOverrides({
    development: {
      TEST1: {val: "test1"},
      TEST2: {val: "test2"},
      TEST3: {val: "test3"}
    },
    staging: {
      TEST1: {val: "test1-staging"},
      TEST2: {val: "test2-staging"},
      TEST3: {val: "test3-staging"}
    },
    production: {
      TEST1: {inherits: "development", locked: true},
      TEST2: {inherits: "staging", locked: true},
      TEST3: {val: "test3-prod", locked: true}
    }
  })).toEqual({TEST1: "test1", TEST2: "test2-staging"})
})


