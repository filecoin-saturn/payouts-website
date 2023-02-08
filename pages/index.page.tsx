import React from 'react';

// 0xe058CfF7D4eA8B3d0B2682D7c76035988fb4A7b5
import App from '../src/App';
export { Page };
import { PageContext } from '../renderer/types';
function Page() {
    return (
        <>
            <App />
        </>
    );
}

// export default (pageContext: PageContext) => pageContext.urlPathname === '/';
