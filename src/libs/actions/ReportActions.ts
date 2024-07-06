import type {OnyxCollection} from 'react-native-onyx';
import Onyx, { useOnyx } from 'react-native-onyx';
import * as ReportActionUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report as OnyxReportType, ReportActions} from '@src/types/onyx';
import type ReportAction from '@src/types/onyx/ReportAction';
import * as Report from './Report';

type IgnoreDirection = 'parent' | 'child';

let allReportActions: OnyxCollection<ReportActions>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (value) => (allReportActions = value),
});

let allReports: OnyxCollection<OnyxReportType>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (allReports = value),
});

function clearReportActionErrors(reportID: string, reportAction: ReportAction, keys?: string[]) {
    //check this func
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);

    if (!reportAction?.reportActionID) {
        console.log('32')
        return;
    }

    if (reportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || reportAction.isOptimisticAction) {
        console.log('37')

        // Delete the optimistic action
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
            [reportAction.reportActionID]: null,
        });

        // If there's a linked transaction, delete that too
        const linkedTransactionID = ReportActionUtils.getLinkedTransactionID(reportAction.reportActionID, originalReportID ?? '-1');
        if (linkedTransactionID) {
            console.log('46')
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${linkedTransactionID}`, null);
        }

        // Delete the failed task report too
        const taskReportID = ReportActionUtils.getReportActionMessage(reportAction)?.taskReportID;
        if (taskReportID && ReportActionUtils.isCreatedTaskReportAction(reportAction)) {
            console.log('53')
            Report.deleteReport(taskReportID);
        }
        return;
    }

    if (keys) {
        console.log('58')
        const errors: Record<string, null> = {};

        keys.forEach((key) => {
            errors[key] = null;
        });

        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
            [reportAction.reportActionID]: {
                errors,
            },
        });
        return;
    }
    console.log('72')
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
        [reportAction.reportActionID]: {
            errors: null,
        },
    });
}

/**
 *
ignore: `undefined` means we want to check both parent and children report actions
ignore: `parent` or `child` means we want to ignore checking parent or child report actions because they've been previously checked
 */
function clearAllRelatedReportActionErrors(reportID: string, reportAction: ReportAction | null | undefined, ignore?: IgnoreDirection, keys?: string[]) {
    console.log('clearAllRelatedReportActionErrors')
    
    const errorKeys = keys ?? Object.keys(reportAction?.errors ?? {});
    if (!reportAction || errorKeys.length === 0) {
        return;
    }

    clearReportActionErrors(reportID, reportAction, keys);

    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    if (report?.parentReportID && report?.parentReportActionID && ignore !== 'parent') {
        const parentReportAction = ReportActionUtils.getReportAction(report.parentReportID, report.parentReportActionID);
        const parentErrorKeys = Object.keys(parentReportAction?.errors ?? {}).filter((err) => errorKeys.includes(err));

        clearAllRelatedReportActionErrors(report.parentReportID, parentReportAction, 'child', parentErrorKeys);
    }

    if (reportAction.childReportID && ignore !== 'child') {
        const childActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportAction.childReportID}`] ?? {};
        Object.values(childActions).forEach((action) => {
            const childErrorKeys = Object.keys(action.errors ?? {}).filter((err) => errorKeys.includes(err));
            clearAllRelatedReportActionErrors(reportAction.childReportID ?? '-1', action, 'parent', childErrorKeys);
        });
    }
}

export {
    // eslint-disable-next-line import/prefer-default-export
    clearAllRelatedReportActionErrors,
};
