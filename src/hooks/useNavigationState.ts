import { useState, useEffect } from 'react';

interface NavigationState {
  tab: string;
  view: string;
  scrollPosition: number;
  currentPage: string;
  activeTab?: string;
}

export const useNavigationState = () => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    tab: 'home',
    view: 'need-action',
    scrollPosition: 0,
    currentPage: '/',
    activeTab: undefined
  });

  const saveNavigationState = (tab: string, view: string, scrollPosition: number = 0, currentPage: string = '/', activeTab?: string) => {
    const state = { tab, view, scrollPosition, currentPage, activeTab };
    setNavigationState(state);
    sessionStorage.setItem('navigationState', JSON.stringify(state));
  };

  const restoreNavigationState = () => {
    const saved = sessionStorage.getItem('navigationState');
    if (saved) {
      const state = JSON.parse(saved);
      setNavigationState(state);
      return state;
    }
    return navigationState;
  };

  const clearNavigationState = () => {
    sessionStorage.removeItem('navigationState');
    setNavigationState({
      tab: 'home',
      view: 'need-action',
      scrollPosition: 0,
      currentPage: '/',
      activeTab: undefined
    });
  };

  return {
    navigationState,
    saveNavigationState,
    restoreNavigationState,
    clearNavigationState
  };
};