import throttle from 'lodash/throttle';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {close} from './Modal';

let isTestToolsModalOpen = false;
Onyx.connect({
    key: ONYXKEYS.IS_TEST_TOOLS_MODAL_OPEN,
    callback: (val) => (isTestToolsModalOpen = val ?? false),
});

/**
 * Toggle the test tools modal open or closed.
 * Throttle the toggle to make the modal stay open if you accidentally tap an extra time, which is easy to do.
 */
function toggleTestToolsModal() {
    const toggle = () => {
        const toggleIsTestToolsModalOpen = () => {
            const newIsOpen = !isTestToolsModalOpen;
            if (newIsOpen) {
                if (typeof window !== 'undefined' && window.history && window.history.pushState) {
                    window.history.pushState({modal: 'TestTools'}, '');
                }
            } else {
                if (typeof window !== 'undefined' && window.history && window.history.back) {
                    window.history.back();
                }
            }
            Onyx.set(ONYXKEYS.IS_TEST_TOOLS_MODAL_OPEN, newIsOpen);
        };
        if (!isTestToolsModalOpen) {
            close(toggleIsTestToolsModalOpen);
            return;
        }
        toggleIsTestToolsModalOpen();
    };
    const throttledToggle = throttle(toggle, CONST.TIMING.TEST_TOOLS_MODAL_THROTTLE_TIME);
    throttledToggle();
}

/** Closes the test tools modal if it is currently open */
function closeTestToolsModal() {
    if (!isTestToolsModalOpen) {
        return;
    }
    if (typeof window !== 'undefined' && window.history && typeof window.history.back === 'function') {
        window.history.back();
    }
    Onyx.set(ONYXKEYS.IS_TEST_TOOLS_MODAL_OPEN, false);
}

export {toggleTestToolsModal, closeTestToolsModal};
