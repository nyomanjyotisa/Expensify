import React from 'react';
import {View} from 'react-native';
import type {StyleProp} from 'react-native';
import type {ViewStyle} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import AvatarWithIndicator from '@components/AvatarWithIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';

type ProfileAvatarWithIndicatorProps = {
    /** Whether the avatar is selected */
    isSelected?: boolean;

    /** Whether the avatar is hovered */
    isHovered?: boolean;

    /** Avatar Container styles */
    containerStyles?: StyleProp<ViewStyle>;
};

function ProfileAvatarWithIndicator({isSelected = false, isHovered = false, containerStyles}: ProfileAvatarWithIndicatorProps) {
    const styles = useThemeStyles();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [isLoading = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    return (
        <OfflineWithFeedback
            pendingAction={currentUserPersonalDetails.pendingFields?.avatar}
            style={containerStyles}
        >
            <View style={[styles.pRelative]}>
                <View style={[(isSelected || isHovered) && styles.selectedAvatarBorder, styles.pAbsolute]} />
                <AvatarWithIndicator
                    source={currentUserPersonalDetails.avatar}
                    accountID={currentUserPersonalDetails.accountID}
                    fallbackIcon={currentUserPersonalDetails.fallbackIcon}
                    isLoading={!!(isLoading && !currentUserPersonalDetails.avatar)}
                />
            </View>
        </OfflineWithFeedback>
    );
}

ProfileAvatarWithIndicator.displayName = 'ProfileAvatarWithIndicator';

export default ProfileAvatarWithIndicator;
