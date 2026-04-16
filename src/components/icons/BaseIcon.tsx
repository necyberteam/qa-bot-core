import React from 'react';

interface BaseIconProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  color?: string;
  children?: React.ReactNode;
}

const BaseIcon: React.FC<BaseIconProps> = ({
  width = 24,
  height = 24,
  color = 'currentColor',
  children,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
};

export default BaseIcon;
