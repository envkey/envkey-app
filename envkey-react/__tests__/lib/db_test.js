import db from "lib/db"

const app1 = {id: "001", slug: "app-1"},
      app2 = {id: "002", slug: "app-2"},
      appServer1 = {id: "001", appId: "001", name : "server 1"},
      appServer2 = {id: "002", appId: "002", name: "server 2"},
      user1 = {id: "001", slug: "user-1"},
      user2 = {id: "002", slug: "user-2", deleted: true},
      appUser1 = {id: "001", appId: "001", userId: "001", role: "development"},
      appUser2 = {id: "002", appId: "002", userId: "002", role: "admin"},
      appTest1 = {id: "001", appId: "001", testId: "001", name : "test 1", other: "z"},
      appTest2 = {id: "002", appId: "001", testId: "002", name : "test 2", other: "a"},
      appTest3 = {id: "003", appId: "002", testId: "002", name : "test 3", other: "b"},
      test1 = {id: "001", name: "z-test"},
      test2 = {id: "002", name: "a-test"}

const state = {
  apps: { "001": app1, "002": app2 },
  appServers: { "001": appServer1, "002": appServer2 },
  users: { "001": user1, "002": user2 },
  appUsers: { "001": appUser1, "002": appUser2 },
  emptyItems: {},
  appTests: {"001": appTest1, "002": appTest2, "003": appTest3},
  tests: {"001": test1, "002": test2}
}

describe("path", ()=>{

  it("should get the element at the specified path", ()=>{
    expect(db.path("apps")(state)).toEqual(state.apps)
    expect(db.path("users", "001", "slug")(state)).toEqual("user-1")
    expect(db("users").path("001", "slug")(state)).toEqual("user-1")
  })

})

describe("index", ()=>{

  it("should get the element index", ()=>{
    expect(db.index("apps")(state)).toEqual(state.apps)
    expect(db("apps").index()(state)).toEqual(state.apps)
  })

})

describe("find", ()=>{

  it("should get the element", ()=>{
    expect(db.find("apps")("001", state)).toEqual(app1)
    expect(db("apps").find()("001", state)).toEqual(app1)
  })

  it("should work as a partial when only id argument supplied", ()=>{
    expect(db("apps").find()("001")(state)).toEqual(app1)
  })

  it("should return undefined when the object isn't found", ()=>{
    expect(db("apps").find()("008")(state)).toBeUndefined()
    expect(db("emptyItems").find()("001")(state)).toBeUndefined()
  })

})

describe("ids", ()=>{

  it("should get all the ids for a type", ()=>{
    expect(db("apps").ids()(state)).toEqual([app1.id, app2.id])
  })

})

describe("list", ()=>{

  it("should get an array of elements", ()=>{
    expect(db.list("apps")(state)).toEqual([app1,app2])
    expect(db("apps").list()(state)).toEqual([app1,app2])
  })

  it("should order elements by a prop when specified", ()=>{
    expect(db("appUsers").list({sortBy: "role"})(state)).toEqual([appUser2,appUser1])
  })

  it("should order elements by a function when specified", ()=>{
    expect(db("appUsers").list({sortBy: appUser => appUser.role})(state)).toEqual([appUser2,appUser1])
  })

  it("should order elements in reverse when specified", ()=>{
    expect(db("appUsers").list({sortBy: "role", reverse: true})(state)).toEqual([appUser1, appUser2])
  })

  it("should group elements when specified", ()=>{
    expect(db("appUsers").list({groupBy: "role"})(state)).toEqual({
      "admin": [appUser2],
      "development": [appUser1]
    })
  })

  it("should group and order elements when specified", ()=>{
    expect(db("appTests").list({groupBy: "appId", sortBy: "other"})(state)).toEqual({
      "001": [appTest2, appTest1],
      "002": [appTest3]
    })
  })

  it("should filter elements when specified", ()=>{
    expect(db("apps").list({where: {slug: "app-1"}})(state)).toEqual([app1])
  })

  it("should filter, group, and order elements when specified", ()=>{
    expect(db("appTests").list({groupBy: "appId", sortBy: "other", where: {other: val => val != "b"}})(state)).toEqual({
      "001": [appTest2, appTest1]
    })
  })

})

describe("indexBy", ()=>{

  it("should index the element by a prop", ()=>{
    expect(db.indexBy("apps", "slug")(state)).toEqual({ "app-1": app1, "app-2": app2})
    expect(db("apps").indexBy("slug")(state)).toEqual({ "app-1": app1, "app-2": app2})
  })

})

describe("group", ()=>{

  it("should group the elements by a prop", ()=>{
    expect(db.group("apps", "slug")(state)).toEqual({
      "app-1": [app1],
      "app-2": [app2]
    })
    expect(db("apps").group("slug")(state)).toEqual({
      "app-1": [app1],
      "app-2": [app2]
    })
  })

  it("should group the elements by a function", ()=>{
    expect(db.group("apps", ({id, slug})=> [id,slug].join("-"))(state)).toEqual({
      "001-app-1": [app1],
      "002-app-2": [app2]
    })
    expect(db("apps").group(({id, slug})=> [id,slug].join("-"))(state)).toEqual({
      "001-app-1": [app1],
      "002-app-2": [app2]
    })
  })

})

describe("where", ()=>{
  it("should select by props", ()=>{
    expect(db.where("apps", {slug: "app-1", id: "001"})(state)).toEqual([app1])
    expect(db.where("apps", {slug: "app-1", id: "002"})(state)).toEqual([])
    expect(db("apps").where({slug: "app-1", id: "001"})(state)).toEqual([app1])
  })

  it("should select by functions", ()=>{
    expect(db.where("apps", {slug: slug => slug == "app-1", id: id => id == "001"})(state)).toEqual([app1])
  })

  it("should select by a mixture of props and functions", ()=>{
    expect(db.where("apps", {slug: "app-1", id: id => id == "001"})(state)).toEqual([app1])
  })

  it("should accept sort options", ()=>{
    expect(db("appTests").where({appId: "001"}, {sortBy: "other"})(state)).toEqual([appTest2, appTest1])
  })
})


describe("whereIn", ()=>{
  it("should select elements where prop is in a list", ()=>{
    expect(db.whereIn("apps", "slug", ["app-1", "app-2"])(state)).toEqual([app1, app2])
    expect(db.whereIn("apps", "slug", ["app-7", "app-2"])(state)).toEqual([app2])
    expect(db.whereIn("apps", "slug", ["app-7", "app-9"])(state)).toEqual([])
    expect(db("apps").whereIn("slug", ["app-1", "app-2"])(state)).toEqual([app1, app2])
  })

  it("should accept sort options", ()=>{
    expect(db("apps").whereIn("slug", ["app-1", "app-2"], {sortBy: "name", reverse: true})(state)).toEqual([app2, app1])
  })
})

describe("whereNotIn", ()=>{
  it("should NOT elements where prop is in a list", ()=>{
    expect(db.whereNotIn("apps", "slug", ["app-1", "app-2"])(state)).toEqual([])
    expect(db.whereNotIn("apps", "slug", ["app-7", "app-2"])(state)).toEqual([app1])
    expect(db.whereNotIn("apps", "slug", ["app-7", "app-9"])(state)).toEqual([app1, app2])
  })

  it("should accept sort options", ()=>{
    expect(db("apps").whereNotIn("slug", ["app-9", "app-12"], {sortBy: "name", reverse: true})(state)).toEqual([app2, app1])
  })
})


describe("findBy", ()=>{

  it("should get a single element by a prop", ()=>{
    expect(db.findBy("apps", "slug")("app-1", state)).toEqual(app1)
    expect(db("apps").findBy("slug")("app-1", state)).toEqual(app1)
  })

  it("should work as a partial when only val argument supplied", ()=>{
    expect(db.findBy("apps", "slug")("app-1")(state)).toEqual(app1)
    expect(db("apps").findBy("slug")("app-1")(state)).toEqual(app1)
  })

})

describe("hasMany", ()=>{

  it("should list the app's associations", ()=>{
    expect(db.hasMany("apps", "appServers")("001", state)).toEqual([appServer1])
    expect(db("apps").hasMany("appServers")("001", state)).toEqual([appServer1])
  })

  it("should work as a partial when only id argument supplied", ()=>{
    expect(db.hasMany("apps", "appServers")("001")(state)).toEqual([appServer1])
    expect(db("apps").hasMany("appServers")("001")(state)).toEqual([appServer1])
  })

  it("should order elements by a prop when specified", ()=>{
    expect(db("apps").hasMany("appTests", {sortBy: "other"})("001")(state)).toEqual([appTest2, appTest1])
  })

  it("should order elements by a function when specified", ()=>{
    expect(db("apps").hasMany("appTests", {sortBy: o => o.other})("001")(state)).toEqual([appTest2, appTest1])
  })

  it("should order elements in reverse when specified", ()=>{
    expect(db("apps").hasMany("appTests", {sortBy: "other", reverse: true})("001")(state)).toEqual([appTest1, appTest2])
  })

})

describe("hasAndBelongsToMany", ()=>{

  it("should list the association, and add the join table key", ()=>{
    expect(db.hasAndBelongsToMany("apps", "users")("001", state)).toEqual([
       {id: "001", slug: "user-1", relation: appUser1}
    ])
    expect(db("apps").hasAndBelongsToMany("users")("001", state)).toEqual([
       {id: "001", slug: "user-1", relation: appUser1}
    ])
  })

  it("should work as a partial when only id argument supplied", ()=>{
    expect(db.hasAndBelongsToMany("apps", "users")("001")(state)).toEqual([
       {id: "001", slug: "user-1", relation: appUser1}
    ])
    expect(db("apps").hasAndBelongsToMany("users")("001")(state)).toEqual([
       {id: "001", slug: "user-1", relation: appUser1}
    ])
  })

  it("should work when specifying the join table", ()=>{
    expect(db.hasAndBelongsToMany("apps", "users", {through: "appUsers"})("001", state)).toEqual([
       {id: "001", slug: "user-1", relation: appUser1}
    ])
  })

  it("should accept sort options", ()=>{
    expect(db("apps").hasAndBelongsToMany("tests", {through: "appTests", sortBy: "name"})("001", state)).toEqual([
      {id: "002", name: "a-test", relation: appTest2},
      {id: "001", name: "z-test", relation: appTest1}
    ])
  })

  it("should accept filter and group options", ()=>{
    expect(db("apps").hasAndBelongsToMany("tests", {through: "appTests",
                                                    where: {name: "a-test"},
                                                    groupBy: "id"})("001", state)).toEqual({
      "002": [{id: "002", name: "a-test", relation: appTest2}]
    })
  })

  it("should accept sort and group options", ()=>{
    expect(db("apps").hasAndBelongsToMany("tests", {through: "appTests",
                                                    sortBy: "name",
                                                    groupBy: ({relation})=> relation.other })("001", state)).toEqual({
      "a": [{id: "002", name: "a-test", relation: appTest2}],
      "z": [{id: "001", name: "z-test", relation: appTest1}]
    })
  })

})