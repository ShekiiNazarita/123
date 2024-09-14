import React, { type FC } from 'react';
import { useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useApi } from 'hooks/useApi';
import UserPasswordForm from 'apps/dashboard/components/users/passwordForm';
import type { UserContextType } from './type';

const UserPassword: FC = () => {
    const { user } = useOutletContext<UserContextType>();
    const { user: loggedInUser } = useApi();
    return (
        <Box className='readOnlyContent'>
            <UserPasswordForm user={user} loggedInUser={loggedInUser} />
        </Box>
    );
};

export default UserPassword;

