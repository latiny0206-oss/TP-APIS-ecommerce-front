import { createSlice } from '@reduxjs/toolkit'

const navigationSlice = createSlice({
  name: 'navigation',
  initialState: {
    currentView: 'home',
    params: {},
  },
  reducers: {
    navigate(state, { payload }) {
      const view   = typeof payload === 'string' ? payload : payload.view
      const params = typeof payload === 'string' ? {} : (payload.params || {})
      state.currentView = view
      state.params = params
    },
  },
})

export const { navigate } = navigationSlice.actions
export default navigationSlice.reducer
