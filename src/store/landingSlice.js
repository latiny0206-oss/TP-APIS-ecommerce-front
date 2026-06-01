import { createSlice } from '@reduxjs/toolkit'

const landingSlice = createSlice({
  name: 'landing',
  initialState: {
    mobileMenuOpen:      false,
    heroVariant:         'midnight',
    activeCategoryFilter: 'todos',
  },
  reducers: {
    toggleMobileMenu(state)  { state.mobileMenuOpen = !state.mobileMenuOpen },
    closeMobileMenu(state)   { state.mobileMenuOpen = false },
    setHeroVariant(state, { payload }) { state.heroVariant = payload },
    setActiveCategoryFilter(state, { payload }) { state.activeCategoryFilter = payload },
  },
})

export const {
  toggleMobileMenu,
  closeMobileMenu,
  setHeroVariant,
  setActiveCategoryFilter,
} = landingSlice.actions

export default landingSlice.reducer
