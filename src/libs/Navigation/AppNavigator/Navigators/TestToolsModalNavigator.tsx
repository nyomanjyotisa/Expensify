import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import TestToolsModal from '@components/TestToolsModal';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {TestToolsModalModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const Stack = createPlatformStackNavigator<TestToolsModalModalNavigatorParamList>();

function TestToolsModalNavigator() {
    return (
        <NoDropZone>
            <View>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    <Stack.Screen
                        name={SCREENS.TEST_TOOLS_MODAL.ROOT}
                        component={TestToolsModal}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

TestToolsModalNavigator.displayName = 'TestToolsModalNavigator';

export default TestToolsModalNavigator;
