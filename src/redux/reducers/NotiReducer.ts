const SET_LOADING = 'SET_LOADING';

const LoadingInitialState = {
  loading: false
}

export const setLoading = (loading: boolean) => ({
  type: SET_LOADING,
  loading
})

export const NotiReducer = (state = LoadingInitialState, action: any) => {
  switch(action.type) {
    case SET_LOADING:
      return {
        ...state,
        loading: action.loading
      }
    default:
      return state;
  }
}
