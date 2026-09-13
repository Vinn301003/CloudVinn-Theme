import TransferListener from '@/components/server/TransferListener';
import React, { useEffect, useState } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import TransitionRouter from '@/TransitionRouter';
import WebsocketHandler from '@/components/server/WebsocketHandler';
import { ServerContext } from '@/state/server';
import { CSSTransition } from 'react-transition-group';
import Spinner from '@/components/elements/Spinner';
import { NotFound, ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import { useStoreState } from 'easy-peasy';
import InstallListener from '@/components/server/InstallListener';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { useLocation } from 'react-router';
import ConflictStateRenderer from '@/components/server/ConflictStateRenderer';
import PermissionRoute from '@/components/elements/PermissionRoute';
import routes from '@/routers/routes';
import ServerSidebar from '@/components/server/ServerSidebar';
import styled from 'styled-components/macro';
import tw from 'twin.macro';

const ServerContent = styled.main`
    ${tw`w-full min-w-0`};

    min-height: calc(100vh - 70px);

    background:
        radial-gradient(
            circle at 15% 10%,
            rgba(14, 165, 233, 0.05),
            transparent 28%
        ),
        radial-gradient(
            circle at 90% 20%,
            rgba(99, 102, 241, 0.04),
            transparent 30%
        ),
        linear-gradient(
            180deg,
            rgba(2, 8, 23, 0.15),
            rgba(2, 8, 23, 0.45)
        ),
        #050b14;

    overflow-x: hidden;
`;

export default () => {
    const match = useRouteMatch<{ id: string }>();
    const location = useLocation();

    const rootAdmin = useStoreState(
        (state) => state.user.data!.rootAdmin
    );

    const [error, setError] = useState('');

    const id = ServerContext.useStoreState(
        (state) => state.server.data?.id
    );

    const uuid = ServerContext.useStoreState(
        (state) => state.server.data?.uuid
    );

    const inConflictState = ServerContext.useStoreState(
        (state) => state.server.inConflictState
    );

    const getServer = ServerContext.useStoreActions(
        (actions) => actions.server.getServer
    );

    const clearServerState = ServerContext.useStoreActions(
        (actions) => actions.clearServerState
    );

    const to = (value: string, url = false) => {
        if (value === '/') {
            return url ? match.url : match.path;
        }

        return `${(url ? match.url : match.path).replace(
            /\/*$/,
            ''
        )}/${value.replace(/^\/+/, '')}`;
    };

    useEffect(
        () => () => {
            clearServerState();
        },
        []
    );

    useEffect(() => {
        setError('');

        getServer(match.params.id).catch((error) => {
            console.error(error);
            setError(httpErrorToHuman(error));
        });

        return () => {
            clearServerState();
        };
    }, [match.params.id]);

    return (
        <React.Fragment key={'server-router'}>
            <NavigationBar />

            {!uuid || !id ? (
                error ? (
                    <ServerError message={error} />
                ) : (
                    <Spinner size={'large'} centered />
                )
            ) : (
                <>
                    <InstallListener />

                    <TransferListener />

                    <WebsocketHandler />

                    <CSSTransition
                        timeout={150}
                        classNames={'fade'}
                        appear
                        in
                    >
                        <>
                            <ServerSidebar />

                            <ServerContent>
                                {inConflictState &&
                                (!rootAdmin ||
                                    (rootAdmin &&
                                        !location.pathname.endsWith(
                                            `/server/${id}`
                                        ))) ? (
                                    <ConflictStateRenderer />
                                ) : (
                                    <ErrorBoundary>
                                        <TransitionRouter>
                                            <Switch
                                                location={location}
                                            >
                                                {routes.server.map(
                                                    ({
                                                        path,
                                                        permission,
                                                        component:
                                                            Component,
                                                    }) => (
                                                        <PermissionRoute
                                                            key={path}
                                                            permission={
                                                                permission
                                                            }
                                                            path={to(
                                                                path
                                                            )}
                                                            exact
                                                        >
                                                            <Spinner.Suspense>
                                                                <Component />
                                                            </Spinner.Suspense>
                                                        </PermissionRoute>
                                                    )
                                                )}

                                                <Route
                                                    path={'*'}
                                                    component={NotFound}
                                                />
                                            </Switch>
                                        </TransitionRouter>
                                    </ErrorBoundary>
                                )}
                            </ServerContent>
                        </>
                    </CSSTransition>
                </>
            )}
        </React.Fragment>
    );
};
