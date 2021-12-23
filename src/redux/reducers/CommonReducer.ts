const SET_TITLE = 'SET_TITLE';

const CommonInitialState = {
  title: ''
}

export const setTitle = (title: string) => ({
  type: SET_TITLE,
  title
})

export const CommonReducer = (state = CommonInitialState, action: any) => {
  switch(action.type) {
    case SET_TITLE:
      return {
        ...state,
        title: action.title
      }
    default:
      return state;
  }
}
