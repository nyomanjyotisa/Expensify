import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import REASON_INPUT_IDS from '@src/types/form/ExitSurveyReasonForm';
import type {ExitReason} from '@src/types/form/ExitSurveyReasonForm';
import RESPONSE_INPUT_IDS from '@src/types/form/ExitSurveyResponseForm';

let exitReason: ExitReason | undefined;
let exitSurveyResponse: string | undefined;
Onyx.connect({
    key: ONYXKEYS.FORMS.EXIT_SURVEY_REASON_FORM,
    callback: (value) => (exitReason = value?.[REASON_INPUT_IDS.REASON]),
});
Onyx.connect({
    key: ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM,
    callback: (value) => (exitSurveyResponse = value?.[RESPONSE_INPUT_IDS.RESPONSE]),
});

function saveExitReason(reason: ExitReason) {
    Onyx.set(ONYXKEYS.FORMS.EXIT_SURVEY_REASON_FORM, {[REASON_INPUT_IDS.REASON]: reason});
}

function saveResponse(response: string) {
    Onyx.set(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, {[RESPONSE_INPUT_IDS.RESPONSE]: response});
}

/**
 * Save the user's response to the mandatory exit survey in the back-end.
 */
function switchToOldDot() {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.IS_SWITCHING_TO_OLD_DOT,
            value: true,
        },
    ];

    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.IS_SWITCHING_TO_OLD_DOT,
            value: false,
        },
    ];

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(
        SIDE_EFFECT_REQUEST_COMMANDS.SWITCH_TO_OLD_DOT,
        {
            reason: exitReason,
            surveyResponse: exitSurveyResponse,
        },
        {optimisticData, finallyData},
    );
}

export {saveExitReason, saveResponse, switchToOldDot};
