import { createSlice } from '@reduxjs/toolkit'

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    drawerOpen:    false,
    editProductId: null,
  },
  reducers: {
    openDrawer(state, { payload }) {
      state.drawerOpen    = true
      state.editProductId = payload || null
    },
    closeDrawer(state) {
      state.drawerOpen    = false
      state.editProductId = null
    },
  },
})

export const { openDrawer, closeDrawer } = adminSlice.actions
export default adminSlice.reducer
