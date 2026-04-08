import useRootNavigationState from '@hooks/useRootNavigationState';
import useSidePanelState from '@hooks/useSidePanelState';
import Navigation from '@libs/Navigation/Navigation';

/**
 * True when the topmost report in navigation is the same report the help / side panel would open
 * (Concierge DM, or admins room when that variant is active). Hides redundant help UI on that chat.
 */
function useIsViewingSidePanelTargetReport() {
    const {reportID: sidePanelTargetReportID} = useSidePanelState();
    const topmostReportID = useRootNavigationState((state) => Navigation.getTopmostReportId(state));

    return !!sidePanelTargetReportID && !!topmostReportID && sidePanelTargetReportID === topmostReportID;
}

export default useIsViewingSidePanelTargetReport;
