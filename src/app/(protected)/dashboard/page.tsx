"use client";

import React from 'react';
import { useUser } from '@clerk/nextjs';

const DashboradPage = () => {
    const { user } = useUser();

    return(
        <div>
            <p>{user?.firstName}</p>
            <p>{user?.lastName}</p>
        </div>
    )

}

export default DashboradPage;