import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import * as Modal from '@userActions/Modal';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type SearchRouterContext = {
    isSearchRouterDisplayed: boolean;
    openSearchRouter: () => void;
    closeSearchRouter: () => void;
    toggleSearch: () => void;
    registerSearchPageInput: (ref: AnimatedTextInputRef) => void;
    unregisterSearchPageInput: () => void;
};

const defaultSearchContext: SearchRouterContext = {
    isSearchRouterDisplayed: false,
    openSearchRouter: () => {},
    closeSearchRouter: () => {},
    toggleSearch: () => {},
    registerSearchPageInput: () => {},
    unregisterSearchPageInput: () => {},
};

const Context = React.createContext<SearchRouterContext>(defaultSearchContext);

function SearchRouterContextProvider({children}: ChildrenProps) {
    const [isSearchRouterDisplayed, setIsSearchRouterDisplayed] = useState(false);
    const searchRouterDisplayedRef = useRef(false);
    const searchPageInputRef = useRef<AnimatedTextInputRef>();

    useEffect(() => {
        const handlePopState = (event: any) => {
            const state = event.state;
            // Reopen modal when navigating forward to the "SearchRouter" state
            if (state?.modal === 'SearchRouter' && !isSearchRouterDisplayed) {
                setIsSearchRouterDisplayed(true);
                searchRouterDisplayedRef.current = true;
            }
            // Close modal when navigating back from the "SearchRouter" state
            if (!state?.modal && isSearchRouterDisplayed) {
                setIsSearchRouterDisplayed(false);
                searchRouterDisplayedRef.current = false;
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isSearchRouterDisplayed]);

    const routerContext = useMemo(() => {
        const openSearchRouter = () => {
            Modal.close(
                () => {
                    window.history.pushState({modal: 'SearchRouter'}, '');
                    setIsSearchRouterDisplayed(true);
                    searchRouterDisplayedRef.current = true;
                },
                false,
                true,
            );
        };
        const closeSearchRouter = () => {
            if (window.history.state?.modal === 'SearchRouter') {
                window.history.back();
            }
            setIsSearchRouterDisplayed(false);
            searchRouterDisplayedRef.current = false;
        };

        // There are callbacks that live outside of React render-loop and interact with SearchRouter
        // So we need a function that is based on ref to correctly open/close it
        // When user is on `/search` page we focus the Input instead of showing router
        const toggleSearch = () => {
            const isUserOnSearchPage = isSearchTopmostFullScreenRoute();

            if (isUserOnSearchPage && searchPageInputRef.current) {
                if (searchPageInputRef.current.isFocused()) {
                    searchPageInputRef.current.blur();
                } else {
                    searchPageInputRef.current.focus();
                }
            } else if (searchRouterDisplayedRef.current) {
                closeSearchRouter();
            } else {
                openSearchRouter();
            }
        };

        const registerSearchPageInput = (ref: AnimatedTextInputRef) => {
            searchPageInputRef.current = ref;
        };

        const unregisterSearchPageInput = () => {
            searchPageInputRef.current = undefined;
        };

        return {
            isSearchRouterDisplayed,
            openSearchRouter,
            closeSearchRouter,
            toggleSearch,
            registerSearchPageInput,
            unregisterSearchPageInput,
        };
    }, [isSearchRouterDisplayed, setIsSearchRouterDisplayed]);

    return <Context.Provider value={routerContext}>{children}</Context.Provider>;
}

function useSearchRouterContext() {
    return useContext(Context);
}

SearchRouterContextProvider.displayName = 'SearchRouterContextProvider';

export {SearchRouterContextProvider, useSearchRouterContext};
