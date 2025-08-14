import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import DateUtils from '@libs/DateUtils';
import {rand64} from '@libs/NumberUtils';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import * as TransactionUtils from '../../src/libs/TransactionUtils';
import type {ReportAction, ReportActions, Transaction} from '../../src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

function generateTransaction(values: Partial<Transaction> = {}): Transaction {
    const reportID = '1';
    const amount = 100;
    const currency = 'USD';
    const comment = '';
    const attendees: Attendee[] = [];
    const created = '2023-10-01';
    const baseValues = TransactionUtils.buildOptimisticTransaction({
        transactionParams: {
            amount,
            currency,
            reportID,
            comment,
            attendees,
            created,
        },
    });

    return {...baseValues, ...values};
}

const CURRENT_USER_ID = 1;
const FAKE_NEW_REPORT_ID = '2';
const FAKE_OLD_REPORT_ID = '3';
const FAKE_SELF_DM_REPORT_ID = '4';

const newReport = {
    reportID: FAKE_NEW_REPORT_ID,
    ownerAccountID: CURRENT_USER_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
};
const selfDM = {
    reportID: FAKE_SELF_DM_REPORT_ID,
    ownerAccountID: CURRENT_USER_ID,
    chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
};

const reportCollectionDataSet: ReportCollectionDataSet = {
    [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`]: newReport,
    [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_SELF_DM_REPORT_ID}`]: selfDM,
};

describe('Transaction', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: CURRENT_USER_ID},
                ...reportCollectionDataSet,
            },
        });
    });

    beforeEach(() => {
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('changeTransactionsReport', () => {
        it('correctly moves the IOU report action when an unreported transaction is added to an expense report', async () => {
            const transaction = generateTransaction({
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            });
            const oldIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: '0',
                    IOUTransactionID: transaction.transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_SELF_DM_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            changeTransactionsReport([transaction.transactionID], FAKE_NEW_REPORT_ID);
            await waitForBatchedUpdates();
            const reportActions = await new Promise<OnyxEntry<ReportActions>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_NEW_REPORT_ID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            expect(getIOUActionForTransactionID(Object.values(reportActions ?? {}), transaction.transactionID)).toBeDefined();
        });

        it('correctly moves the IOU report action when a transaction is moved from one expense report to another', async () => {
            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
            });
            const oldIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: CURRENT_USER_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: FAKE_OLD_REPORT_ID,
                    IOUTransactionID: transaction.transactionID,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_OLD_REPORT_ID}`, {[oldIOUAction.reportActionID]: oldIOUAction});

            changeTransactionsReport([transaction.transactionID], FAKE_NEW_REPORT_ID);
            await waitForBatchedUpdates();
            const reportActions = await new Promise<OnyxEntry<ReportActions>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${FAKE_NEW_REPORT_ID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            expect(getIOUActionForTransactionID(Object.values(reportActions ?? {}), transaction.transactionID)).toBeDefined();
        });

        it('correctly updates report totals when moving transactions between reports', async () => {
            const oldReport = {
                reportID: FAKE_OLD_REPORT_ID,
                ownerAccountID: CURRENT_USER_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                total: 1000,
                nonReimbursableTotal: 200,
            };
            const targetReport = {
                reportID: FAKE_NEW_REPORT_ID,
                ownerAccountID: CURRENT_USER_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                total: 500,
                nonReimbursableTotal: 100,
            };
            
            // Create reimbursable transaction
            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
                amount: 100,
                reimbursable: true,
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_OLD_REPORT_ID}`, oldReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`, targetReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);

            changeTransactionsReport([transaction.transactionID], FAKE_NEW_REPORT_ID);
            await waitForBatchedUpdates();

            // Verify old report totals are updated
            const updatedOldReport = await new Promise<any>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${FAKE_OLD_REPORT_ID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            // Verify target report totals are updated
            const updatedTargetReport = await new Promise<any>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            // Old report should have totals decreased by transaction amounts
            expect(updatedOldReport.total).toBe(900); // 1000 - 100
            expect(updatedOldReport.nonReimbursableTotal).toBe(200); // 200 - 0 (fully reimbursable)

            // Target report should have totals increased by transaction amounts
            expect(updatedTargetReport.total).toBe(600); // 500 + 100
            expect(updatedTargetReport.nonReimbursableTotal).toBe(100); // 100 + 0 (fully reimbursable)
        });

        it('correctly handles non-reimbursable transactions when moving between reports', async () => {
            const oldReport = {
                reportID: FAKE_OLD_REPORT_ID,
                ownerAccountID: CURRENT_USER_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                total: 1000,
                nonReimbursableTotal: 200,
            };
            const targetReport = {
                reportID: FAKE_NEW_REPORT_ID,
                ownerAccountID: CURRENT_USER_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                total: 500,
                nonReimbursableTotal: 100,
            };
            
            // Create non-reimbursable transaction
            const transaction = generateTransaction({
                reportID: FAKE_OLD_REPORT_ID,
                amount: 100,
                reimbursable: false,
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_OLD_REPORT_ID}`, oldReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`, targetReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);

            changeTransactionsReport([transaction.transactionID], FAKE_NEW_REPORT_ID);
            await waitForBatchedUpdates();

            const updatedOldReport = await new Promise<any>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${FAKE_OLD_REPORT_ID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            const updatedTargetReport = await new Promise<any>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${FAKE_NEW_REPORT_ID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            // Old report should have totals decreased appropriately
            expect(updatedOldReport.total).toBe(900); // 1000 - 100
            expect(updatedOldReport.nonReimbursableTotal).toBe(100); // 200 - 100

            // Target report should have totals increased appropriately
            expect(updatedTargetReport.total).toBe(600); // 500 + 100
            expect(updatedTargetReport.nonReimbursableTotal).toBe(200); // 100 + 100
        });
    });
});
