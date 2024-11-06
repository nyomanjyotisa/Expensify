import {useEffect} from 'react';
import * as Link from '@userActions/Link';
import useEnvironment from '@hooks/useEnvironment';
import {getNavatticURL} from '@libs/TourUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import { useOnyx } from 'react-native-onyx';
import * as Welcome from '@userActions/Welcome';

function SelfTour() {
    const {environment} = useEnvironment();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);

    useEffect(() => {
        Welcome.setSelfTourViewed();
        Link.openExternalLink(getNavatticURL(environment, introSelected?.choice));
        Navigation.goBack();
    }, []);

    return null;
}

export default SelfTour;
