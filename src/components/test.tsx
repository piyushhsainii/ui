export const test = [
    {
        name: "accordion",
        code: 'import react from react'
    },
    {
        name: "navbar",
        code: `\`\`\`
'use client'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ClassNameValue } from 'tailwind-merge';
import { cn } from '@/lib/utils';

interface NavbarProps {
    logo: string;
}

const Navbar = ({
    children,
    className
}: {
    children?: React.ReactNode,
    className?: ClassNameValue
}) => {
    const [scrollPosition, setScrollPosition] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [])
    return (
        <div className={cn('relative flex justify-center m-auto bg-zinc-950', className)}>
            <motion.div
                initial={{ width: '100%', top: 0 }}
                animate={{
                    width: scrollPosition > 150 ? '75vw' : '100%',
                    top: scrollPosition > 150 ? 12 : 0
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 65
                }}
                className={cn(\`
                    fixed  items-center p-3 py-1 justify-between   bg-zinc-950 border-opacity-30 \${scrollPosition > 150 && 'border-gray-600 border    rounded-2xl'}
                    mx-auto font-sans max-w-screen-2xl
                \`, className)}>
                <div className='bg-gradient-to-r from-transparent via-slate-800/30 to-transparent  flex items-center justify-between'>
                    {children}
                </div>
            </motion.div>
        </div>
    )
}

const Logo = ({
    children,
}: Readonly<{
    children?: React.ReactNode;
}>) => {
    return (
        <div className='mr-4 px-7 cursor-pointer active:brightness-80 rounded-full text-base focus:outline-none transition ease-in-out duration-30 py-2 px-4 text-white bg-transparent opacity-80 hover:opacity-100'>
            {children}
        </div>
    )
}
const LeftSideItems = ({ children }: Readonly<{ children?: React.ReactNode }>) => {
    return (
        <div className='flex items-center gap-5 cursor-pointer'>
            {children}
        </div>
    )
}
const RightSideItems = ({ children }: Readonly<{ children?: React.ReactNode }>) => {
    return (
        <div className='flex items-center gap-5 cursor-pointer'>
            {children}
        </div>
    )
}
const NavbarItem = ({
    children,
    className,
}: Readonly<{
    children?: React.ReactNode;
    className?: ClassNameValue
}>) => {
    return (
        <div className={cn('tracking-wider cursor-pointer active:brightness-80 rounded-full text-base focus:outline-none transition ease-in-out duration-30 py-2 px-4 text-white bg-transparent opacity-80 hover:opacity-100',
            className
        )}>
            {children}
        </div>
    )
}

export { Navbar, NavbarItem, Logo, LeftSideItems, RightSideItems }
\`\`\``
    }
]