/**
 * ModalNavigationManager is a utility to handle modal stacking and back navigation
 * It keeps track of which modals are open and ensures only the top modal responds to back navigation
 */

interface ModalState {
    modalId: string;
    timestamp: number;
}

// Keep track of modals in a stack
let modalStack: ModalState[] = [];

const ModalNavigationManager = {
    /**
     * Register a modal in the stack when it's opened
     * @param modalId - Unique identifier for the modal
     */
    registerModal: (modalId: string): void => {
        // Remove any existing instance of this modal (in case it's reopened)
        modalStack = modalStack.filter((modal) => modal.modalId !== modalId);

        // Add the modal to the top of the stack
        modalStack.push({
            modalId,
            timestamp: Date.now(),
        });

        // Do not manipulate history here - that's handled by the Modal component
        // Only pushing history state for the first modal can cause issues with nested modals
    },

    /**
     * Remove a modal from the stack when it's closed
     * @param modalId - Unique identifier for the modal
     */
    unregisterModal: (modalId: string): void => {
        // Find the modal before removing it
        const modalIndex = modalStack.findIndex((modal) => modal.modalId === modalId);
        if (modalIndex !== -1) {
            modalStack.splice(modalIndex, 1);
        }
    },

    /**
     * Check if a modal is the top-most one in the stack
     * @param modalId - Unique identifier for the modal
     * @returns boolean indicating if this is the top modal
     */
    isTopModal: (modalId: string): boolean => {
        if (modalStack.length === 0) {
            return false;
        }
        return modalStack[modalStack.length - 1].modalId === modalId;
    },

    /**
     * Check if the modal is in the stack (at any position)
     * @param modalId - Unique identifier for the modal
     * @returns boolean indicating if the modal exists in the stack
     */
    isInModalStack: (modalId: string): boolean => {
        return modalStack.some((modal) => modal.modalId === modalId);
    },

    /**
     * Handle back navigation for a modal
     * @param modalId - Unique identifier for the modal
     * @param closeFunction - Function to close the modal
     * @returns boolean indicating if navigation was handled
     */
    handleBackNavigation: (modalId: string, closeFunction: () => void): boolean => {
        // Only close if this is the topmost modal
        if (ModalNavigationManager.isTopModal(modalId)) {
            closeFunction();
            return true;
        }
        return false;
    },

    /**
     * Get the current modal stack (for debugging)
     * @returns Copy of the modal stack
     */
    getModalStack: (): ModalState[] => [...modalStack],

    /**
     * Reset the entire modal stack (useful for testing or handling edge cases)
     */
    resetModalStack: (): void => {
        modalStack = [];
    },
};

export default ModalNavigationManager;
