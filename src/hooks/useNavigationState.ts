import { useState, useEffect } from 'react';

interface NavigationState {
  tab: string;
  view: string;
  scrollPosition: number;
}

export const useNavigationState = () => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    tab: 'home',
    view: 'need-action',
    scrollPosition: 0
  });

  const saveNavigationState = (tab: string, view: string, scrollPosition: number = 0) => {
    const state = { tab, view, scrollPosition };
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
      scrollPosition: 0
    });
  };

  return {
    navigationState,
    saveNavigationState,
    restoreNavigationState,
    clearNavigationState
  };
};