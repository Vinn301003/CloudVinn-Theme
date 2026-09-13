import styled from 'styled-components/macro';
import React, { memo } from 'react';
import { ServerContext } from '@/state/server';
import Can from '@/components/elements/Can';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';
import Spinner from '@/components/elements/Spinner';
import Features from '@feature/Features';
import Console from '@/components/server/console/Console';
import StatGraphs from '@/components/server/console/StatGraphs';
import PowerButtons from '@/components/server/console/PowerButtons';
import ServerDetailsBlock from '@/components/server/console/ServerDetailsBlock';
import { Alert } from '@/components/elements/alert';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

const ConsoleBackground = styled.div`
    position: relative;
    min-height: calc(100vh - 70px);
    isolation: isolate;
    background: #020617;

    &::before {
        content: '';
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;

        background-image:
            linear-gradient(
                180deg,
                rgba(2, 6, 23, 0.18) 0%,
                rgba(2, 6, 23, 0.38) 50%,
                rgba(2, 6, 23, 0.68) 100%
            ),
            url('/assets/images/cloudvinn-console-bg.png');

        background-position: center center;
        background-size: cover;
        background-repeat: no-repeat;
    }

    &::after {
        content: '';
        position: fixed;
        inset: 0;
        z-index: 1;
        pointer-events: none;

        background:
            radial-gradient(
                circle at 15% 20%,
                rgba(14, 165, 233, 0.12),
                transparent 35%
            ),
            radial-gradient(
                circle at 85% 25%,
                rgba(99, 102, 241, 0.12),
                transparent 35%
            );
    }

    > * {
        position: relative;
        z-index: 2;
    }
`;

const ServerConsoleContainer = () => {
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const description = ServerContext.useStoreState((state) => state.server.data!.description);
    const isInstalling = ServerContext.useStoreState((state) => state.server.isInstalling);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const eggFeatures = ServerContext.useStoreState((state) => state.server.data!.eggFeatures, isEqual);
    const isNodeUnderMaintenance = ServerContext.useStoreState(
        (state) => state.server.data!.isNodeUnderMaintenance
    );

    return (
    <ConsoleBackground>

        <ServerContentBlock
                title={'Console'}
                className={'!bg-transparent'}
            >
            {(isNodeUnderMaintenance || isInstalling || isTransferring) && (
                <Alert type={'warning'} className={'mb-4'}>
                    {isNodeUnderMaintenance
                        ? 'The node of this server is currently under maintenance and all actions are unavailable.'
                        : isInstalling
                        ? 'This server is currently running its installation process and most actions are unavailable.'
                        : 'This server is currently being transferred to another node and all actions are unavailable.'}
                </Alert>
            )}

            <div className={'grid grid-cols-4 gap-4 mb-4'}>
                <div className={'hidden sm:block sm:col-span-2 lg:col-span-3 pr-4'}>
                    <h1
                        className={
                            'font-header font-medium text-2xl text-gray-50 leading-relaxed line-clamp-1'
                        }
                    >
                        {name}
                    </h1>

                    <p className={'text-sm line-clamp-2'}>
                        {description}
                    </p>
                </div>

                <div className={'col-span-4 sm:col-span-2 lg:col-span-1 self-end'}>
                    <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                        <div className={'flex flex-col items-stretch space-y-3'}>
                            
                            {/* Provider Information */}
                            <div
                                className={
                                    'relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-neutral-900/80 to-indigo-500/10 px-4 py-3 shadow-lg'
                                }
                            >
                                {/* Glow */}
                                <div
                                    className={
                                        'absolute -top-10 -right-10 h-20 w-20 rounded-full bg-blue-500/10 blur-2xl pointer-events-none'
                                    }
                                />

                                <div className={'relative'}>
                                    <div
                                        className={
                                            'flex items-center text-xs font-semibold uppercase tracking-wider text-blue-400'
                                        }
                                    >
                                        <span className={'mr-2'}>⚡</span>
                                        Provider By
                                    </div>

                                    <div
                                        className={
                                            'mt-1 text-sm font-bold text-white tracking-wide'
                                        }
                                    >
                                        VinnCloud
                                    </div>

                                    <a
                                        href={'https://discord.gg/DzA4ZjF6yG'}
                                        target={'_blank'}
                                        rel={'noopener noreferrer'}
                                        className={
                                            'mt-1 flex items-center text-xs text-neutral-400 transition-colors duration-150 hover:text-blue-400'
                                        }
                                    >
                                        <span className={'mr-1.5'}>Discord Community</span>
                                        <span className={'text-blue-400'}>
                                            discord.gg/DzA4ZjF6yG ↗
                                        </span>
                                    </a>
                                </div>
                            </div>

                            {/* Power Buttons */}
                            <PowerButtons className={'flex sm:justify-end space-x-2'} />
                        </div>
                    </Can>
                </div>
            </div>

            <div className={'grid grid-cols-4 gap-2 sm:gap-4 mb-4'}>
                <div className={'flex col-span-4 lg:col-span-3'}>
                    <Spinner.Suspense>
                        <Console />
                    </Spinner.Suspense>
                </div>

                <ServerDetailsBlock
                    className={'col-span-4 lg:col-span-1 order-last lg:order-none'}
                />
            </div>

            <div className={'grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4'}>
                <Spinner.Suspense>
                    <StatGraphs />
                </Spinner.Suspense>
            </div>

                        <Features enabled={eggFeatures} />
                    </ServerContentBlock>
        

    </ConsoleBackground>
   );
};

export default memo(ServerConsoleContainer, isEqual);
