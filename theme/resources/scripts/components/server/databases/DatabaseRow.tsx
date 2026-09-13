import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faDatabase,
    faEye,
    faTrashAlt,
    faServer,
    faGlobe,
    faUser,
    faCopy,
} from '@fortawesome/free-solid-svg-icons';
import Modal from '@/components/elements/Modal';
import { Form, Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import FlashMessageRender from '@/components/FlashMessageRender';
import { ServerContext } from '@/state/server';
import deleteServerDatabase from '@/api/server/databases/deleteServerDatabase';
import { httpErrorToHuman } from '@/api/http';
import RotatePasswordButton from '@/components/server/databases/RotatePasswordButton';
import Can from '@/components/elements/Can';
import { ServerDatabase } from '@/api/server/databases/getServerDatabases';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import Label from '@/components/elements/Label';
import Input from '@/components/elements/Input';
import CopyOnClick from '@/components/elements/CopyOnClick';

interface Props {
    database: ServerDatabase;
    className?: string;
}

export default ({ database, className }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    const { addError, clearFlashes } = useFlash();

    const [visible, setVisible] = useState(false);
    const [connectionVisible, setConnectionVisible] = useState(false);

    const appendDatabase = ServerContext.useStoreActions(
        (actions) => actions.databases.appendDatabase
    );

    const removeDatabase = ServerContext.useStoreActions(
        (actions) => actions.databases.removeDatabase
    );

    const jdbcConnectionString = `jdbc:mysql://${database.username}${
        database.password ? `:${encodeURIComponent(database.password)}` : ''
    }@${database.connectionString}/${database.name}`;

    const schema = object().shape({
        confirm: string()
            .required('The database name must be provided.')
            .oneOf(
                [database.name.split('_', 2)[1], database.name],
                'The database name must be provided.'
            ),
    });

    const submit = (
        values: { confirm: string },
        { setSubmitting }: FormikHelpers<{ confirm: string }>
    ) => {
        clearFlashes();

        deleteServerDatabase(uuid, database.id)
            .then(() => {
                setVisible(false);
                setTimeout(() => removeDatabase(database.id), 150);
            })
            .catch((error) => {
                console.error(error);
                setSubmitting(false);

                addError({
                    key: 'database:delete',
                    message: httpErrorToHuman(error),
                });
            });
    };

    return (
        <>
            {/* DELETE MODAL */}
            <Formik
                onSubmit={submit}
                initialValues={{ confirm: '' }}
                validationSchema={schema}
                isInitialValid={false}
            >
                {({ isSubmitting, isValid, resetForm }) => (
                    <Modal
                        visible={visible}
                        dismissable={!isSubmitting}
                        showSpinnerOverlay={isSubmitting}
                        onDismissed={() => {
                            setVisible(false);
                            resetForm();
                        }}
                    >
                        <FlashMessageRender
                            byKey={'database:delete'}
                            css={tw`mb-6`}
                        />

                        <h2 css={tw`text-2xl font-semibold mb-4`}>
                            Delete Database
                        </h2>

                        <p css={tw`text-sm text-neutral-300 leading-relaxed`}>
                            This action is permanent. The database and all
                            associated data will be deleted.
                        </p>

                        <Form css={tw`m-0 mt-6`}>
                            <Field
                                type={'text'}
                                id={'confirm_name'}
                                name={'confirm'}
                                label={'Confirm Database Name'}
                                description={
                                    'Enter the database name to confirm deletion.'
                                }
                            />

                            <div css={tw`mt-6 text-right`}>
                                <Button
                                    type={'button'}
                                    isSecondary
                                    css={tw`mr-2`}
                                    onClick={() => setVisible(false)}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type={'submit'}
                                    color={'red'}
                                    disabled={!isValid}
                                >
                                    Delete Database
                                </Button>
                            </div>
                        </Form>
                    </Modal>
                )}
            </Formik>

            {/* CONNECTION MODAL */}
            <Modal
                visible={connectionVisible}
                onDismissed={() => setConnectionVisible(false)}
            >
                <FlashMessageRender
                    byKey={'database-connection-modal'}
                    css={tw`mb-6`}
                />

                <h3 css={tw`mb-6 text-2xl font-semibold`}>
                    Database Connection
                </h3>

                <div>
                    <Label>Endpoint</Label>
                    <CopyOnClick text={database.connectionString}>
                        <Input
                            type={'text'}
                            readOnly
                            value={database.connectionString}
                        />
                    </CopyOnClick>
                </div>

                <div css={tw`mt-5`}>
                    <Label>Connections From</Label>
                    <Input
                        type={'text'}
                        readOnly
                        value={database.allowConnectionsFrom}
                    />
                </div>

                <div css={tw`mt-5`}>
                    <Label>Username</Label>
                    <CopyOnClick text={database.username}>
                        <Input
                            type={'text'}
                            readOnly
                            value={database.username}
                        />
                    </CopyOnClick>
                </div>

                <Can action={'database.view_password'}>
                    <div css={tw`mt-5`}>
                        <Label>Password</Label>
                        <CopyOnClick
                            text={database.password}
                            showInNotification={false}
                        >
                            <Input
                                type={'text'}
                                readOnly
                                value={database.password}
                            />
                        </CopyOnClick>
                    </div>
                </Can>

                <div css={tw`mt-5`}>
                    <Label>JDBC Connection String</Label>
                    <CopyOnClick
                        text={jdbcConnectionString}
                        showInNotification={false}
                    >
                        <Input
                            type={'text'}
                            readOnly
                            value={jdbcConnectionString}
                        />
                    </CopyOnClick>
                </div>

                <div css={tw`mt-6 flex flex-wrap justify-end gap-2`}>
                    <Can action={'database.update'}>
                        <RotatePasswordButton
                            databaseId={database.id}
                            onUpdate={appendDatabase}
                        />
                    </Can>

                    <Button
                        isSecondary
                        onClick={() => setConnectionVisible(false)}
                    >
                        Close
                    </Button>
                </div>
            </Modal>

            {/* DATABASE CARD */}
            <div
                className={className}
                css={tw`
                    relative
                    overflow-hidden
                    rounded-xl
                    border border-neutral-700
                    bg-neutral-900
                    shadow-lg
                    transition-all
                    duration-200
                    hover:border-cyan-500
                    hover:shadow-xl
                `}
            >
                {/* cyan accent */}
                <div
                    css={tw`
                        absolute
                        left-0
                        top-0
                        bottom-0
                        w-1
                        bg-cyan-500
                    `}
                />

                <div css={tw`p-5`}>
                    <div
                        css={tw`
                            flex
                            flex-col
                            lg:flex-row
                            lg:items-center
                            gap-5
                        `}
                    >
                        {/* DATABASE NAME */}
                        <div css={tw`flex items-center flex-1 min-w-0`}>
                            <div
                                css={tw`
                                    flex
                                    items-center
                                    justify-center
                                    w-12
                                    h-12
                                    rounded-xl
                                    bg-cyan-500 bg-opacity-10
                                    text-cyan-400
                                    flex-shrink-0
                                `}
                            >
                                <FontAwesomeIcon
                                    icon={faDatabase}
                                    size={'lg'}
                                />
                            </div>

                            <div css={tw`ml-4 min-w-0`}>
                                <CopyOnClick text={database.name}>
                                    <p
                                        css={tw`
                                            text-lg
                                            font-semibold
                                            text-white
                                            truncate
                                            cursor-pointer
                                        `}
                                    >
                                        {database.name}
                                    </p>
                                </CopyOnClick>

                                <p
                                    css={tw`
                                        text-xs
                                        text-neutral-500
                                        mt-1
                                        uppercase
                                        tracking-wider
                                    `}
                                >
                                    MySQL Database
                                </p>
                            </div>
                        </div>

                        {/* INFORMATION */}
                        <div
                            css={tw`
                                grid
                                grid-cols-1
                                sm:grid-cols-3
                                gap-3
                                flex-1
                            `}
                        >
                            <div
                                css={tw`
                                    rounded-lg
                                    bg-neutral-800
                                    px-4
                                    py-3
                                `}
                            >
                                <div
                                    css={tw`
                                        flex
                                        items-center
                                        text-xs
                                        text-neutral-500
                                        uppercase
                                        tracking-wide
                                    `}
                                >
                                    <FontAwesomeIcon
                                        icon={faServer}
                                        css={tw`mr-2`}
                                    />
                                    Endpoint
                                </div>

                                <CopyOnClick text={database.connectionString}>
                                    <p
                                        css={tw`
                                            mt-1
                                            text-sm
                                            text-neutral-200
                                            truncate
                                            cursor-pointer
                                        `}
                                    >
                                        {database.connectionString}
                                    </p>
                                </CopyOnClick>
                            </div>

                            <div
                                css={tw`
                                    rounded-lg
                                    bg-neutral-800
                                    px-4
                                    py-3
                                `}
                            >
                                <div
                                    css={tw`
                                        flex
                                        items-center
                                        text-xs
                                        text-neutral-500
                                        uppercase
                                        tracking-wide
                                    `}
                                >
                                    <FontAwesomeIcon
                                        icon={faGlobe}
                                        css={tw`mr-2`}
                                    />
                                    Access
                                </div>

                                <p
                                    css={tw`
                                        mt-1
                                        text-sm
                                        text-neutral-200
                                        truncate
                                    `}
                                >
                                    {database.allowConnectionsFrom}
                                </p>
                            </div>

                            <div
                                css={tw`
                                    rounded-lg
                                    bg-neutral-800
                                    px-4
                                    py-3
                                `}
                            >
                                <div
                                    css={tw`
                                        flex
                                        items-center
                                        text-xs
                                        text-neutral-500
                                        uppercase
                                        tracking-wide
                                    `}
                                >
                                    <FontAwesomeIcon
                                        icon={faUser}
                                        css={tw`mr-2`}
                                    />
                                    Username
                                </div>

                                <CopyOnClick text={database.username}>
                                    <p
                                        css={tw`
                                            mt-1
                                            text-sm
                                            text-neutral-200
                                            truncate
                                            cursor-pointer
                                        `}
                                    >
                                        {database.username}
                                    </p>
                                </CopyOnClick>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div
                            css={tw`
                                flex
                                items-center
                                gap-2
                                flex-shrink-0
                            `}
                        >
                            <a
                             href={'https://db.cloudvinn.my.id'}
    target={'_blank'}
    rel={'noopener noreferrer'}
    css={tw`
        flex
        items-center
        justify-center
        w-11
        h-11
        rounded
        bg-neutral-800
        text-neutral-300
        transition-colors
        duration-150
        hover:bg-neutral-700
        hover:text-white
    `}
    title={'Open phpMyAdmin'}
>
    <FontAwesomeIcon icon={faDatabase} />
</a>
                            <Button
                                isSecondary
                                onClick={() => setConnectionVisible(true)}
                                css={tw`
                                    flex
                                    items-center
                                    justify-center
                                    w-11
                                    h-11
                                    p-0
                                `}
                            >
                                <FontAwesomeIcon icon={faEye} />
                            </Button>

                            <Can action={'database.delete'}>
                                <Button
                                    color={'red'}
                                    isSecondary
                                    onClick={() => setVisible(true)}
                                    css={tw`
                                        flex
                                        items-center
                                        justify-center
                                        w-11
                                        h-11
                                        p-0
                                    `}
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </Button>
                            </Can>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
