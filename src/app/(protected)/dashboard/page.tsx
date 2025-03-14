"use client";

import React from 'react';
import { useUser } from '@clerk/nextjs';
import useProjects from '@/hooks/use-projects';
import { Github } from 'lucide-react';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

const DashboradPage = () => {
    const {project} = useProjects();
    const { user } = useUser();

    return(
        <div>
            <div className='flex items-center justify-between flex-wrap gap-4'>
                <div className='flex w-fit bg-primary text-white p-2 rounded-md'>
                    <Github className='size-5 text-white'/>
                    <div className='flex  ml-2 items-center'>
                        <span>This project is linked to </span>
                        <Link href={project?.githubUrl || "/"} className='text-white underline'>{" " + project?.githubUrl}</Link>
                        <ExternalLink className='size-5'/>
                    </div>

                </div>

            </div>
        </div>
    )

}

export default DashboradPage;