import React from 'react';
import {View} from 'react-native';
import useIsAuthenticated from '@hooks/useIsAuthenticated';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import {shouldShowProfileTool} from '@userActions/TestTool';
import ROUTES from '@src/ROUTES';
import Button from './Button';
import ClientSideLoggingToolMenu from './ClientSideLoggingToolMenu';
import ProfilingToolMenu from './ProfilingToolMenu';
import ScrollView from './ScrollView';
import TestToolMenu from './TestToolMenu';
import TestToolRow from './TestToolRow';
import Text from './Text';

function getRouteBasedOnAuthStatus(isAuthenticated: boolean, activeRoute: string) {
    return isAuthenticated ? ROUTES.SETTINGS_CONSOLE.getRoute(activeRoute) : ROUTES.PUBLIC_CONSOLE_DEBUG.getRoute(activeRoute);
}

const modalContentMaxHeightPercentage = 0.75;

function TestToolsModalPage() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowWidth, windowHeight} = useWindowDimensions();
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const activeRoute = Navigation.getActiveRoute();
    const isAuthenticated = useIsAuthenticated();
    const route = getRouteBasedOnAuthStatus(isAuthenticated, activeRoute);

    // CENTERED_SMALL (for mobile)
    const centeredContainerStyle = {
        flex: 1,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // To see if the modal has a background
    };
    const centeredContentStyle = [
        StyleUtils.getTestToolsModalStyle(windowWidth),
        {maxHeight: windowHeight * modalContentMaxHeightPercentage},
        styles.p5,
        {
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 0},
            shadowOpacity: 0.1,
            shadowRadius: 5,
            borderRadius: variables.componentBorderRadiusLarge,
            backgroundColor: theme.componentBG,
        },
    ];

    // BOTTOM_DOCKED (for desktop)
    const bottomDockedContainerStyle = {
        flex: 1,
        alignItems: 'center' as const,
        justifyContent: 'flex-end' as const,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // To see if the modal has a background
    };
    const bottomDockedContentStyle = [
        {
            width: '100%',
            borderTopLeftRadius: variables.componentBorderRadiusLarge,
            borderTopRightRadius: variables.componentBorderRadiusLarge,
            paddingTop: variables.componentBorderRadiusLarge,
            paddingHorizontal: variables.w20,
            justifyContent: 'center' as const,
            overflow: 'hidden' as const,
            backgroundColor: theme.componentBG,
            maxHeight: windowHeight * modalContentMaxHeightPercentage,
        },
    ];

    const containerStyle = shouldUseNarrowLayout ? bottomDockedContainerStyle : centeredContainerStyle;
    const contentStyle = shouldUseNarrowLayout ? bottomDockedContentStyle : centeredContentStyle;

    return (
        <View style={containerStyle}>
            <View style={contentStyle}>
                <ScrollView>
                    <Text
                        style={[styles.textLabelSupporting, styles.mt4, styles.mb3]}
                        numberOfLines={1}
                    >
                        {translate('initialSettingsPage.troubleshoot.releaseOptions')}
                    </Text>
                    {shouldShowProfileTool() && <ProfilingToolMenu />}
                    <ClientSideLoggingToolMenu />
                    {!!false && (
                        <TestToolRow title={translate('initialSettingsPage.troubleshoot.debugConsole')}>
                            <Button
                                small
                                text={translate('initialSettingsPage.debugConsole.viewConsole')}
                                onPress={() => {
                                    Navigation.navigate(route);
                                }}
                            />
                        </TestToolRow>
                    )}
                    <TestToolMenu />
                </ScrollView>
            </View>
        </View>
    );
}

TestToolsModalPage.displayName = 'TestToolsModalPage';

export default TestToolsModalPage;
