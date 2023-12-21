import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import OnyxProvider from '@components/OnyxProvider';
import OptionRow from '@components/OptionRow';

/* eslint-disable react/jsx-props-no-spreading */

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
export default {
    title: 'Components/OptionRow',
    component: OptionRow,
    argTypes: {
        mode: {
            options: ['default', 'compact'],
            control: {type: 'radio'},
        },
    },
    args: {
        mode: 'default',
        optionIsFocused: false,
        showSelectedState: false,
        isSelected: false,
        boldStyle: false,
        showTitleTooltip: false,
        isDisabled: false,
        backgroundColor: 'white',
        option: {
            text: 'Test Option',
            alternateText: 'Alternate text',
            icons: [{source: Expensicons.ConciergeAvatar, name: 'Test Option', type: 'avatar'}],
            login: 'test@expensify.com',
            reportID: null,
            isChatRoom: false,
            participantsList: [],
            descriptiveText: '',
            tooltipText: 'Tooltip text',
        },
    },
};

function Template(args) {
    return (
        <OnyxProvider>
            <OptionRow {...args} />
        </OnyxProvider>
    );
}

// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Default = Template.bind({});

export {Default};
