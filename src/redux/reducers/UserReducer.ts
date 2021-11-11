const SET_USER = 'set_user';

/*{
  id,
  uid, // firebase uid
  email,
  name,
  account_type,
}*/
const UserInitialState = {
  user: null
}

export const setUser = (user: any) => ({
  type: SET_USER,
  user
})

export const UserReducer = (state = UserInitialState, action: any) => {
  switch(action.type) {
    case SET_USER:
      return {
        ...state,
        user: action.user
      }
    default:
      return state;
  }
}
