import {isAuthenticating, currentUser} from 'reducers/auth_reducers'
import {LOGIN,
        LOGIN_SUCCESS,
        LOGIN_FAILED,
        TOKEN_INVALID} from 'actions'

describe("isAuthenticating", ()=>{

  it("should return the initial state for an undefined action type", ()=>{
    expect(isAuthenticating(undefined, {})).toEqual(false)
  })

  it("should return true for a login request", ()=>{
    expect(isAuthenticating(undefined, {type: LOGIN})).toEqual(true)
  })

})