import React, {useCallback, useRef} from 'react';
import type {View} from 'react-native';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import {useVideoPopoverMenuContext} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';
import type {AnchorPosition} from '@styles/index';

type VideoPopoverMenuProps = {
    /** Whether  popover menu is visible. */
    isPopoverVisible?: boolean;

    /** Callback executed to hide popover when an item is selected. */
    hidePopover?: (selectedItem?: PopoverMenuItem, index?: number) => void;

    /** The horizontal and vertical anchors points for the popover.  */
    anchorPosition?: AnchorPosition;
};

/**
 * VideoPopoverMenu is a popover menu that appears when a user taps the three dots
 * in the video player. It allows selecting playback speed and other options.
 */
function VideoPopoverMenu({
    isPopoverVisible = false,
    hidePopover = () => {},
    anchorPosition = {
        horizontal: 0,
        vertical: 0,
    },
}: VideoPopoverMenuProps) {
    const {menuItems} = useVideoPopoverMenuContext();
    const videoPlayerMenuRef = useRef<View | HTMLDivElement>(null);

    // Create modified menu items that won't close the parent modal
    const modifiedMenuItems = useCallback(() => {
        return menuItems.map((item) => {
            // Handle the playback speed submenu items
            if (item.subMenuItems) {
                return {
                    ...item,
                    // Modify each submenu item to ensure it doesn't close parent modal
                    subMenuItems: item.subMenuItems.map((subItem) => ({
                        ...subItem,
                        // When an item is selected, call its onSelected handler and then hide the popover
                        onSelected: () => {
                            if (subItem.onSelected) {
                                subItem.onSelected();
                            }
                            // Hide just this popover without affecting parent modal
                            hidePopover();
                        },
                        // Make sure we don't modify parent modal state
                        shouldKeepModalOpen: true,
                    })),
                };
            }

            // For regular items with no submenu
            return {
                ...item,
                // When an item is selected, call its onSelected handler and then hide the popover
                onSelected: () => {
                    if (item.onSelected) {
                        item.onSelected();
                    }
                    // Hide just this popover without affecting parent modal
                    hidePopover();
                },
                // Make sure we don't modify parent modal state
                shouldKeepModalOpen: true,
            };
        });
    }, [menuItems, hidePopover]);

    // Safe close handler to prevent closing parent modals
    const handleClose = useCallback(() => {
        hidePopover();
    }, [hidePopover]);

    return (
        <PopoverMenu
            onClose={handleClose}
            onItemSelected={(selectedItem) => {
                // Item selection is handled in the modified menu items
                // This handler is just a fallback that won't be called
                if (selectedItem?.onSelected) {
                    selectedItem.onSelected();
                }
            }}
            isVisible={isPopoverVisible}
            anchorPosition={anchorPosition}
            menuItems={modifiedMenuItems()}
            anchorRef={videoPlayerMenuRef}
            shouldUseScrollView
            shouldHandleNavigationBack
            shouldAvoidSafariException
        />
    );
}
VideoPopoverMenu.displayName = 'VideoPopoverMenu';

export default VideoPopoverMenu;
