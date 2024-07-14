import {useFocusEffect} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as App from '@userActions/App';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Session} from '@src/types/onyx';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import * as ReportUtils from '@libs/ReportUtils';

type TrackExpensePageOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

type TrackExpensePageProps = TrackExpensePageOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.TRACK_EXPENSE>;

/*
 * This is a "utility page", that does this:
 *     - If the user is authenticated, find their self DM and and start a Track Expense
 *     - Else re-route to the login page
 */
function TrackExpensePage({session}: TrackExpensePageProps) {
    const styles = useThemeStyles();
    const isUnmounted = useRef(false);

    useFocusEffect(() => {
        if (session && 'authToken' in session) {
            App.confirmReadyToOpenApp();
            Navigation.isNavigationReady().then(() => {
                if (isUnmounted.current) {
                    return;
                }
                IOU.startMoneyRequest(CONST.IOU.TYPE.TRACK, ReportUtils.findSelfDMReportID() ?? '-1')
            });
        } else {
            Navigation.navigate();
        }
    });

    useEffect(
        () => () => {
            isUnmounted.current = true;
        },
        [],
    );

    return (
        <ScreenWrapper testID={TrackExpensePage.displayName}>
            <View style={[styles.borderBottom]}>
                <ReportHeaderSkeletonView onBackButtonPress={Navigation.goBack} />
            </View>
            <ReportActionsSkeletonView />
        </ScreenWrapper>
    );
}

TrackExpensePage.displayName = 'TrackExpensePage';

export default withOnyx<TrackExpensePageProps, TrackExpensePageOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(TrackExpensePage);
