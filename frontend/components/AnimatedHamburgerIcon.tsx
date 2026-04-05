import React from 'react';

interface AnimatedHamburgerIconProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export const AnimatedHamburgerIcon: React.FC<AnimatedHamburgerIconProps> = ({ isOpen, onClick, className }) => {
  const lineClasses = "h-0.5 w-6 bg-current transform transition duration-300 ease-in-out absolute";

  return (
    <button
      onClick={onClick}
      className={`relative w-10 h-10 flex justify-center items-center focus:outline-none rounded-md ${className}`}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <span className={`${lineClasses} ${isOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
      <span className={`${lineClasses} ${isOpen ? 'opacity-0' : ''}`} />
      <span className={`${lineClasses} ${isOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
    </button>
  );
};
