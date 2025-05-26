import React, {useEffect, useRef, useState} from 'react';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import ModalNavigationManager from '@libs/ModalNavigationManager';
import StatusBar from '@libs/StatusBar';
import CONST from '@src/CONST';
import BaseModal from './BaseModal';
import type BaseModalProps from './types';
import type {WindowState} from './types';

function Modal({fullscreen = true, onModalHide = () => {}, type, onModalShow = () => {}, children, shouldHandleNavigationBack, ...rest}: BaseModalProps) {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const [previousStatusBarColor, setPreviousStatusBarColor] = useState<string>();
    // Generate a unique ID for this modal instance
    const modalId = useRef(`modal-${Date.now()}-${Math.floor(Math.random() * 10000)}`).current;

    const setStatusBarColor = (color = theme.appBG) => {
        if (!fullscreen) {
            return;
        }

        StatusBar.setBackgroundColor(color);
    };

    const hideModal = () => {
        onModalHide();
        if (shouldHandleNavigationBack) {
            ModalNavigationManager.unregisterModal(modalId);
        }
        // Only trigger back navigation if this modal was the one that created the history state
        // This prevents nested modals from causing multiple history back actions
        if ((window.history.state as WindowState)?.shouldGoBack && (!shouldHandleNavigationBack || ModalNavigationManager.isTopModal(modalId))) {
            window.history.back();
        }
    };

    const handlePopStateRef = useRef(() => {
        // Only close this modal if it's the top one in the stack
        if (!shouldHandleNavigationBack || ModalNavigationManager.isTopModal(modalId)) {
            rest.onClose();
        }
    });

    const showModal = () => {
        if (shouldHandleNavigationBack) {
            ModalNavigationManager.registerModal(modalId);
            window.history.pushState({shouldGoBack: true, modalId}, '', null);
            window.addEventListener('popstate', handlePopStateRef.current);
        }
        onModalShow?.();
    };

    useEffect(
        () => () => {
            window.removeEventListener('popstate', handlePopStateRef.current);
            if (shouldHandleNavigationBack) {
                ModalNavigationManager.unregisterModal(modalId);
            }
        },
        [modalId, shouldHandleNavigationBack],
    );

    const onModalWillShow = () => {
        const statusBarColor = StatusBar.getBackgroundColor() ?? theme.appBG;

        const isFullScreenModal =
            type === CONST.MODAL.MODAL_TYPE.CENTERED ||
            type === CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE ||
            type === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED ||
            type === CONST.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT;

        if (statusBarColor) {
            setPreviousStatusBarColor(statusBarColor);
            // If it is a full screen modal then match it with appBG, otherwise we use the backdrop color
            setStatusBarColor(isFullScreenModal ? theme.appBG : StyleUtils.getThemeBackgroundColor(statusBarColor));
        }
        rest.onModalWillShow?.();
    };

    const onModalWillHide = () => {
        setStatusBarColor(previousStatusBarColor);
        rest.onModalWillHide?.();
    };

    return (
        <BaseModal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            onModalHide={hideModal}
            onModalShow={showModal}
            onModalWillShow={onModalWillShow}
            onModalWillHide={onModalWillHide}
            avoidKeyboard={false}
            fullscreen={fullscreen}
            useNativeDriver={false}
            useNativeDriverForBackdrop={false}
            type={type}
        >
            {children}
        </BaseModal>
    );
}

Modal.displayName = 'Modal';
export default Modal;
