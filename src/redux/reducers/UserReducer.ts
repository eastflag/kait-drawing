import {UserVO} from "../../pages/model/UserVO";

const SET_USER = 'set_user';

const UserInitialState: UserVO = {};

export const setUser = (user: UserVO) => ({
  type: SET_USER,
  user
})

export const UserReducer = (state = UserInitialState, action: any) => {
  switch(action.type) {
    case SET_USER:
      return {
        ...state,
        ...action.user
      }
    default:
      return state;
  }
}
