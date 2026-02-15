import { NavLinkProps } from 'react-router-dom';

export const navLinkClass: NavLinkProps['className'] = ({ isActive }) =>
  [
    'relative inline-flex items-center gap-1',
    'transition-colors duration-200',
    'after:absolute after:left-1/2 after:bottom-[-4px]',
    'after:h-[2px] after:w-0',
    'after:bg-slate-400',
    'after:transition-all after:duration-250 after:ease-out',
    'after:-translate-x-1/2',
    isActive
      ? 'text-white underline underline-offset-8'
      : 'text-slate-400 hover:text-white hover:after:w-full',
  ].join(' ');