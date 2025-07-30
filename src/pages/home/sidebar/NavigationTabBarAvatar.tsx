import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Hoverable from '@components/Hoverable';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AvatarWithDelegateAvatar from './AvatarWithDelegateAvatar';
import AvatarWithOptionalStatus from './AvatarWithOptionalStatus';
import ProfileAvatarWithIndicator from './ProfileAvatarWithIndicator';

type NavigationTabBarAvatarProps = {
    /** Whether the avatar is selected */
    isSelected?: boolean;

    /** Function to call when the avatar is pressed */
    onPress: () => void;

    /** Additional styles to add to the button */
    style?: StyleProp<ViewStyle>;
};

function NavigationTabBarAvatar({onPress, isSelected = false, style}: NavigationTabBarAvatarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});

    const delegateEmail = account?.delegatedAccess?.delegate ?? '';
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const emojiStatus = currentUserPersonalDetails?.status?.emojiCode ?? '';

    const getChildren = (isHovered: boolean) => {
        if (delegateEmail) {
            return (
                <AvatarWithDelegateAvatar
                    delegateEmail={delegateEmail}
                    isSelected={isSelected}
                    isHovered={isHovered}
                    containerStyle={styles.sidebarStatusAvatarWithEmojiContainer}
                />
            );
        } else if (emojiStatus) {
            return (
                <AvatarWithOptionalStatus
                    emojiStatus={emojiStatus}
                    isSelected={isSelected}
                    isHovered={isHovered}
                    containerStyle={styles.sidebarStatusAvatarWithEmojiContainer}
                />
            );
        } else {
            return (
                <ProfileAvatarWithIndicator
                    isSelected={isSelected}
                    isHovered={isHovered}
                    containerStyles={styles.tn0Half}
                />
            );
        }
    };

    return (
        <Hoverable>
            {(isHovered) => (
                <PressableWithFeedback
                    onPress={onPress}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('sidebarScreen.buttonMySettings')}
                    wrapperStyle={styles.flex1}
                    style={[style, isHovered && styles.sidebarLinkHover]}
                >
                    {getChildren(isHovered)}
                    <Text
                        style={[
                            styles.textSmall,
                            styles.textAlignCenter,
                            isSelected ? styles.textBold : styles.textSupporting,
                            styles.mt0Half,
                            styles.navigationTabBarLabel,
                            isHovered && {color: theme.text},
                        ]}
                    >
                        {translate('initialSettingsPage.account')}
                    </Text>
                </PressableWithFeedback>
            )}
        </Hoverable>
    );
}

NavigationTabBarAvatar.displayName = 'NavigationTabBarAvatar';
export default NavigationTabBarAvatar;
