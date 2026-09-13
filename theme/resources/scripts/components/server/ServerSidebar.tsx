import React, { useState } from 'react';
import { useStoreState } from 'easy-peasy';
import { NavLink, useRouteMatch } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
    faTerminal,
    faFolder,
    faDatabase,
    faClock,
    faUsers,
    faArchive,
    faNetworkWired,
    faRocket,
    faCog,
    faList,
    faExternalLinkAlt,
    faServer,
    faBars,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';

import styled from 'styled-components/macro';
import tw from 'twin.macro';

import { ServerContext } from '@/state/server';
import Can from '@/components/elements/Can';
import routes from '@/routers/routes';

/*
|--------------------------------------------------------------------------
| OVERLAY
|--------------------------------------------------------------------------
*/

const Overlay = styled.div<{ open: boolean }>`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(3px);
    z-index: 9998;

    opacity: ${({ open }) => (open ? 1 : 0)};
    pointer-events: ${({ open }) => (open ? 'auto' : 'none')};

    transition: opacity 180ms ease;
`;

/*
|--------------------------------------------------------------------------
| DRAWER
|--------------------------------------------------------------------------
*/

const Drawer = styled.aside<{ open: boolean }>`
    position: fixed;
    top: 0;
    left: 0;

    width: 320px;
    max-width: 88vw;
    height: 100vh;

    z-index: 9999;

    overflow-y: auto;
    overflow-x: hidden;

    background:
        radial-gradient(
            circle at 0% 0%,
            rgba(14, 165, 233, 0.16),
            transparent 35%
        ),
        radial-gradient(
            circle at 100% 30%,
            rgba(99, 102, 241, 0.10),
            transparent 35%
        ),
        linear-gradient(
            180deg,
            #071321 0%,
            #040b14 55%,
            #02070d 100%
        );

    border-right: 1px solid rgba(56, 189, 248, 0.20);

    box-shadow:
        20px 0 60px rgba(0, 0, 0, 0.45),
        0 0 35px rgba(14, 165, 233, 0.08);

    transform: translateX(${({ open }) => (open ? '0' : '-105%')});

    transition:
        transform 220ms cubic-bezier(0.22, 1, 0.36, 1);

    scrollbar-width: thin;
    scrollbar-color: rgba(59, 130, 246, 0.35) transparent;

    @media (max-width: 700px) {
        width: 290px;
        max-width: 86vw;
    }
`;

/*
|--------------------------------------------------------------------------
| HEADER
|--------------------------------------------------------------------------
*/

const DrawerHeader = styled.div`
    ${tw`
        flex
        items-center
        justify-between
    `};

    padding: 22px 20px 18px;

    border-bottom: 1px solid rgba(56, 189, 248, 0.12);
`;

const BrandArea = styled.div`
    ${tw`
        flex
        items-center
    `};
`;

const BrandIcon = styled.div`
    ${tw`
        flex
        items-center
        justify-center
    `};

    width: 42px;
    height: 42px;

    border-radius: 12px;

    background:
        linear-gradient(
            135deg,
            rgba(14, 165, 233, 0.20),
            rgba(99, 102, 241, 0.12)
        );

    border: 1px solid rgba(56, 189, 248, 0.25);

    color: #38bdf8;

    box-shadow:
        0 0 20px rgba(14, 165, 233, 0.10);
`;

const BrandText = styled.div`
    margin-left: 12px;
`;

const BrandName = styled.div`
    ${tw`
        font-bold
        text-white
    `};

    font-size: 18px;
    letter-spacing: 0.5px;
`;

const BrandSub = styled.div`
    ${tw`
        text-xs
    `};

    color: #64748b;
    margin-top: 2px;
`;

const CloseButton = styled.button`
    ${tw`
        flex
        items-center
        justify-center
    `};

    width: 38px;
    height: 38px;

    border-radius: 10px;

    border: 1px solid rgba(148, 163, 184, 0.12);

    background: rgba(15, 23, 42, 0.70);

    color: #94a3b8;

    cursor: pointer;

    transition: all 150ms ease;

    &:hover {
        color: #ffffff;
        background: rgba(30, 41, 59, 0.95);
        border-color: rgba(56, 189, 248, 0.30);
    }
`;

/*
|--------------------------------------------------------------------------
| SERVER INFO
|--------------------------------------------------------------------------
*/

const ServerInfo = styled.div`
    margin: 18px 16px 20px;
    padding: 15px;

    border-radius: 14px;

    background:
        linear-gradient(
            135deg,
            rgba(14, 165, 233, 0.08),
            rgba(15, 23, 42, 0.55)
        );

    border: 1px solid rgba(56, 189, 248, 0.12);

    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.02);
`;

const ServerStatus = styled.div`
    ${tw`
        flex
        items-center
    `};

    color: #64748b;

    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
`;

const StatusDot = styled.span`
    width: 7px;
    height: 7px;

    margin-right: 8px;

    border-radius: 50%;

    background: #22c55e;

    box-shadow:
        0 0 8px rgba(34, 197, 94, 0.8);
`;

const ServerName = styled.div`
    margin-top: 7px;

    color: #e2e8f0;

    font-size: 15px;
    font-weight: 700;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

/*
|--------------------------------------------------------------------------
| MENU
|--------------------------------------------------------------------------
*/

const MenuTitle = styled.div`
    padding: 0 20px 9px;

    color: #475569;

    font-size: 10px;
    font-weight: 800;

    text-transform: uppercase;
    letter-spacing: 1.5px;
`;

const Menu = styled.div`
    padding: 0 12px 25px;
`;

const MenuItem = styled(NavLink)`
    ${tw`
        flex
        items-center
    `};

    position: relative;

    min-height: 54px;

    margin: 4px 0;

    padding: 7px 10px;

    border-radius: 13px;

    text-decoration: none;

    color: #94a3b8;

    border: 1px solid transparent;

    transition:
        background 150ms ease,
        border-color 150ms ease,
        color 150ms ease,
        transform 150ms ease;

    &:hover {
        color: #e2e8f0;

        background:
            linear-gradient(
                90deg,
                rgba(14, 165, 233, 0.08),
                rgba(30, 41, 59, 0.30)
            );

        border-color: rgba(56, 189, 248, 0.10);

        transform: translateX(2px);
    }

    &.active {
        color: #ffffff;

        background:
            linear-gradient(
                90deg,
                rgba(14, 165, 233, 0.18),
                rgba(59, 130, 246, 0.08)
            );

        border-color: rgba(56, 189, 248, 0.22);

        box-shadow:
            inset 3px 0 0 #0ea5e9,
            0 5px 20px rgba(14, 165, 233, 0.05);
    }

    &.active > div {
        color: #38bdf8;

        background:
            rgba(14, 165, 233, 0.13);

        border-color:
            rgba(56, 189, 248, 0.25);

        box-shadow:
            0 0 15px rgba(14, 165, 233, 0.10);
    }
`;

const IconBox = styled.div`
    ${tw`
        flex
        items-center
        justify-center
        flex-shrink-0
    `};

    width: 42px;
    height: 42px;

    border-radius: 11px;

    background: rgba(15, 23, 42, 0.75);

    border: 1px solid rgba(100, 116, 139, 0.16);

    color: #64748b;

    transition: all 150ms ease;

    svg {
        font-size: 16px;
    }
`;

const MenuText = styled.span`
    margin-left: 13px;

    font-size: 14px;
    font-weight: 600;

    white-space: nowrap;
`;

const ExternalIcon = styled(FontAwesomeIcon)`
    margin-left: auto;

    font-size: 12px;

    color: #475569;
`;

/*
|--------------------------------------------------------------------------
| DIVIDER
|--------------------------------------------------------------------------
*/

const Divider = styled.div`
    height: 1px;

    margin: 7px 18px 12px;

    background:
        linear-gradient(
            90deg,
            transparent,
            rgba(56, 189, 248, 0.16),
            transparent
        );
`;

/*
|--------------------------------------------------------------------------
| HAMBURGER BUTTON
|--------------------------------------------------------------------------
*/

const HamburgerButton = styled.button`
    position: fixed;

    left: 16px;
    top: 86px;

    z-index: 9997;

    width: 48px;
    height: 48px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 14px;

    border: 1px solid rgba(56, 189, 248, 0.28);

    background:
        linear-gradient(
            135deg,
            rgba(14, 165, 233, 0.20),
            rgba(30, 41, 59, 0.85)
        );

    backdrop-filter: blur(12px);

    color: #38bdf8;

    box-shadow:
        0 8px 25px rgba(0, 0, 0, 0.35),
        0 0 18px rgba(14, 165, 233, 0.08);

    cursor: pointer;

    transition: all 160ms ease;

    &:hover {
        color: #ffffff;

        border-color:
            rgba(56, 189, 248, 0.55);

        transform: translateY(-1px);

        box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.40),
            0 0 25px rgba(14, 165, 233, 0.15);
    }

    &:active {
        transform: scale(0.95);
    }

    @media (max-width: 700px) {
        top: 82px;
        left: 12px;

        width: 46px;
        height: 46px;
    }
`;

/*
|--------------------------------------------------------------------------
| ICONS
|--------------------------------------------------------------------------
*/

const menuIcons: Record<string, any> = {
    Console: faTerminal,
    Files: faFolder,
    Databases: faDatabase,
    Schedules: faClock,
    Users: faUsers,
    Backups: faArchive,
    Network: faNetworkWired,
    Startup: faRocket,
    Settings: faCog,
    Activity: faList,
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default () => {
    const [open, setOpen] = useState(false);

    const match = useRouteMatch<{ id: string }>();

    const serverName = ServerContext.useStoreState(
        (state) => state.server.data?.name
    );

    const serverId = ServerContext.useStoreState(
        (state) => state.server.data?.internalId
    );

    const rootAdmin = useStoreState(
        (state) => state.user.data!.rootAdmin
    );

    const to = (value: string) => {
        if (value === '/') {
            return match.url;
        }

        return `${match.url.replace(/\/*$/, '')}/${value.replace(
            /^\/+/,
            ''
        )}`;
    };

    const closeMenu = () => {
        setOpen(false);
    };

    return (
        <>
            <HamburgerButton
                type={'button'}
                onClick={() => setOpen(true)}
                aria-label={'Open server menu'}
            >
                <FontAwesomeIcon icon={faBars} />
            </HamburgerButton>

            <Overlay
                open={open}
                onClick={closeMenu}
            />

            <Drawer open={open}>
                <DrawerHeader>
                    <BrandArea>
                        <BrandIcon>
                            <FontAwesomeIcon icon={faServer} />
                        </BrandIcon>

                        <BrandText>
                            <BrandName>CloudVinn</BrandName>
                            <BrandSub>Server Control Panel</BrandSub>
                        </BrandText>
                    </BrandArea>

                    <CloseButton
                        type={'button'}
                        onClick={closeMenu}
                        aria-label={'Close server menu'}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </CloseButton>
                </DrawerHeader>

                <ServerInfo>
                    <ServerStatus>
                        <StatusDot />
                        Server Online
                    </ServerStatus>

                    <ServerName title={serverName || 'Server'}>
                        {serverName || 'Server'}
                    </ServerName>
                </ServerInfo>

                <MenuTitle>
                    Server Management
                </MenuTitle>

                <Menu>
                    {routes.server
                        .filter((route) => !!route.name)
                        .map((route) => {
                            const icon =
                                menuIcons[route.name!] || faServer;

                            const item = (
                                <MenuItem
                                    key={route.path}
                                    to={to(route.path)}
                                    exact={route.exact}
                                    onClick={closeMenu}
                                >
                                    <IconBox>
                                        <FontAwesomeIcon icon={icon} />
                                    </IconBox>

                                    <MenuText>
                                        {route.name}
                                    </MenuText>
                                </MenuItem>
                            );

                            return route.permission ? (
                                <Can
                                    key={route.path}
                                    action={route.permission}
                                    matchAny
                                >
                                    {item}
                                </Can>
                            ) : (
                                item
                            );
                        })}

                    <Divider />

                    <MenuItem
                        as={'a'}
                        href={'https://db.cloudvinn.my.id'}
                        target={'_blank'}
                        rel={'noopener noreferrer'}
                        onClick={closeMenu}
                    >
                        <IconBox>
                            <FontAwesomeIcon icon={faDatabase} />
                        </IconBox>

                        <MenuText>
                            PHPMyAdmin
                        </MenuText>

                        <ExternalIcon
                            icon={faExternalLinkAlt}
                        />
                    </MenuItem>

                    {rootAdmin && (
                        <MenuItem
                            as={'a'}
                            href={`/admin/servers/view/${serverId}`}
                            target={'_blank'}
                            rel={'noopener noreferrer'}
                            onClick={closeMenu}
                        >
                            <IconBox>
                                <FontAwesomeIcon
                                    icon={faExternalLinkAlt}
                                />
                            </IconBox>

                            <MenuText>
                                Admin Panel
                            </MenuText>

                            <ExternalIcon
                                icon={faExternalLinkAlt}
                            />
                        </MenuItem>
                    )}
                </Menu>
            </Drawer>
        </>
    );
};
