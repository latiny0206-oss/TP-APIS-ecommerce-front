import { createSlice } from '@reduxjs/toolkit'

const productsSlice = createSlice({
  name: 'products',
  initialState: { byId: {}, ids: [] },
  reducers: {
    hydrate(state, { payload }) {
      state.byId = Object.fromEntries(payload.map((p) => [p.id, p]))
      state.ids  = payload.map((p) => p.id)
    },
    upsert(state, { payload }) {
      const isNew = !state.byId[payload.id]
      state.byId[payload.id] = { ...state.byId[payload.id], ...payload }
      if (isNew) state.ids.unshift(payload.id)
    },
    remove(state, { payload }) {
      delete state.byId[payload]
      state.ids = state.ids.filter((id) => id !== payload)
    },
  },
})

export const { hydrate, upsert, remove } = productsSlice.actions
export default productsSlice.reducer
