import React from 'react';

// Official Invitation Homes SVG Icons extracted directly from invitationhomes.com
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

// 1. Official Full Logo
export const InvitationLogo: React.FC<IconProps> = ({ className = "h-8 w-auto", ...props }) => {
  return (
    <img 
      src="/icons/logo.svg" 
      alt="Invitation Homes" 
      className={className} 
      {...(props as any)} 
    />
  );
};

// 2. Official Search Magnifier
export const SearchIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size, ...props }) => (
  <svg 
    width={size || "24"} 
    height={size || "24"} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    {...props}
  >
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M10.5 2C5.80558 2 2 5.80558 2 10.5C2 15.1944 5.80558 19 10.5 19C12.5869 19 14.4988 18.2472 15.9754 16.9961L20.2893 21.3101C20.6798 21.7006 21.313 21.7006 21.7035 21.3101C22.094 20.9195 22.094 20.2864 21.7035 19.8958L17.4146 15.6069C18.4069 14.1837 19 12.4276 19 10.5C19 5.80558 15.1944 2 10.5 2ZM4 10.5C4 6.91015 6.91015 4 10.5 4C14.0899 4 17 6.91015 17 10.5C17 14.0899 14.0899 17 10.5 17C6.91015 17 4 14.0899 4 10.5Z" 
      fill="currentColor"
    />
  </svg>
);

// 3. Official Location Pin Icon
export const LocationPinIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size, ...props }) => (
  <svg 
    width={size || "24"} 
    height={size || "24"} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    {...props}
  >
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M3 12C3 11.4477 3.44772 11 4 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H4C3.44772 13 3 12.5523 3 12Z" 
      fill="currentColor"
    />
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M10.7071 5.29289C11.0976 5.68342 11.0976 6.31658 10.7071 6.70711L5.41421 12L10.7071 17.2929C11.0976 17.6834 11.0976 18.3166 10.7071 18.7071C10.3166 19.0976 9.68342 19.0976 9.29289 18.7071L3.29289 12.7071C2.90237 12.3166 2.90237 11.6834 3.29289 11.2929L9.29289 5.29289C9.68342 4.90237 10.3166 4.90237 10.7071 5.29289Z" 
      fill="currentColor"
    />
  </svg>
);

// 4. Official Checkmark Icon
export const CheckmarkIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg 
    width={size || "24"} 
    height={size || "24"} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    {...props}
  >
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L11 12.5858L17.2929 6.29289C17.6834 5.90237 18.3166 5.90237 18.7071 6.29289C19.0976 6.68342 19.0976 7.31658 18.7071 7.70711L11.7071 14.7071C11.3166 15.0976 10.6834 15.0976 10.2929 14.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" 
      fill="currentColor"
    />
  </svg>
);

// 5. Official Hamburger Toggle
export const HamburgerIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size, ...props }) => (
  <svg 
    width={size || "24"} 
    height={size || "24"} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    {...props}
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M2 12C2 11.4477 2.44772 11 3 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H3C2.44772 13 2 12.5523 2 12Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 5.44772 2.44772 5 3 5H21C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H3C2.44772 7 2 6.55228 2 6Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M2 18C2 17.4477 2.44772 17 3 17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H3C2.44772 19 2 18.5523 2 18Z" />
  </svg>
);

// 6. Official User Avatar Icon
export const UserAvatarIcon: React.FC<IconProps> = ({ className = "w-7 h-7", size, ...props }) => (
  <svg 
    width={size || "34"} 
    height={size || "34"} 
    viewBox="0 0 34 34" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    {...props}
  >
    <path d="M17 33C25.8366 33 33 25.8366 33 17C33 8.16344 25.8366 1 17 1C8.16344 1 1 8.16344 1 17C1 25.8366 8.16344 33 17 33Z" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M17 17C19.2091 17 21 15.2091 21 13C21 10.7909 19.2091 9 17 9C14.7909 9 13 10.7909 13 13C13 15.2091 14.7909 17 17 17Z" />
    <path d="M24 25C24 21.134 20.866 18 17 18C13.134 18 10 21.134 10 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 7. Official Equal Housing Opportunity Logo
export const EqualHousingIcon: React.FC<IconProps> = ({ className = "w-12 h-12", size, ...props }) => (
  <svg 
    width={size || "56"} 
    height={size || "54"} 
    viewBox="0 0 56 54" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    {...props}
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M6.79279 43.367H4.62306V44.2229H6.79279V43.367ZM4.62306 46.7212H6.79279V45.8653H4.62306V46.7212ZM8.63688 47.5772V42.511H3.72996V47.5772H8.63688ZM28 0L0 23.3333H7V54H49V23.3333H56L28 0ZM24 46H18V41H24V46ZM24 37H18V32H24V37ZM38 46H32V41H38V46ZM38 37H32V32H38V37ZM45 49H11V22.5L28 8.33333L45 22.5V49Z" />
  </svg>
);

// 8. Official Social Icons
export const FacebookIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size, ...props }) => (
  <svg 
    width={size || "24"} 
    height={size || "24"} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    {...props}
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M8 7C8 3.68629 10.6863 1 14 1H17V6H14C13.4477 6 13 6.44772 13 7V10H17L16 15H13V23H8V15H5V10H8V7Z" fill="currentColor" />
  </svg>
);

export const InstagramIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size, ...props }) => (
  <svg 
    width={size || "24"} 
    height={size || "24"} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    {...props}
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M1 7C1 3.68629 3.68629 1 7 1H17C20.3137 1 23 3.68629 23 7V17C23 20.3137 20.3137 23 17 23H7C3.68629 23 1 20.3137 1 17V7ZM7 3C4.79086 3 3 4.79086 3 7V17C3 19.2091 4.79086 21 7 21H17C19.2091 21 21 19.2091 21 17V7C21 4.79086 19.2091 3 17 3H7Z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M12.4833 8.98918C11.2031 8.79934 9.94827 9.40049 9.31751 10.5186C8.68676 11.6366 8.81432 13.0286 9.63854 14.0205C10.4628 15.0124 11.8021 15.3853 13.0116 14.9587C14.2212 14.5322 15.0315 13.3984 15.0506 12.1065C15.0357 10.8354 14.2494 9.70425 13.0645 9.24838C12.8735 9.1749 12.6784 9.12297 12.4833 9.09318V8.98918ZM12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7Z" fill="currentColor" />
  </svg>
);

export const YouTubeIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size, ...props }) => (
  <svg 
    width={size || "24"} 
    height={size || "24"} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    {...props}
  >
    <path d="M15.7259 10.9882L10.5361 8.19378C10.164 7.99143 9.71361 8.00107 9.35131 8.21915C8.98902 8.43722 8.7666 8.83151 8.7666 9.25584V14.7442C8.7666 15.1685 8.98902 15.5628 9.35131 15.7808C9.71361 15.9989 10.164 16.0086 10.5361 15.8062L15.7259 13.0118C16.126 12.7969 16.3774 12.3807 16.3774 11.9287C16.3774 11.4767 16.126 11.0605 15.7259 10.8456V10.9882Z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M23.814 7.35546C23.7748 7.02784 23.5692 5.39936 22.7173 4.52248C21.6402 3.41434 20.4457 3.4047 19.8973 3.33725C15.9904 3.05807 12.0051 3.05807 12.0051 3.05807H11.9949C11.9949 3.05807 8.0096 3.05807 4.10271 3.33725C3.55431 3.4047 2.35984 3.41434 1.28274 4.52248C0.430826 5.39936 0.225199 7.02784 0.186029 7.35546C-0.0979434 9.87042 -0.0979434 12.3854 0.186029 14.9003C0.225199 15.228 0.430826 16.8564 1.28274 17.7333C2.22279 18.7065 3.38784 18.8414 4.10271 18.9185C6.31573 19.1305 12 19.1883 12 19.1883C12 19.1883 15.9904 19.1786 19.8973 18.9088C20.4457 18.8414 21.6402 18.8317 22.7173 17.7237C23.5692 16.8468 23.7748 15.2183 23.814 14.8907C24.098 12.3854 24.098 9.87042 23.814 7.35546Z" fill="currentColor" />
  </svg>
);

export const LinkedInIcon: React.FC<IconProps> = ({ className = "w-5 h-5", size, ...props }) => (
  <svg 
    width={size || "24"} 
    height={size || "24"} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    {...props}
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M2 5C2 3.34315 3.34315 2 5 2C6.65685 2 8 3.34315 8 5C8 6.65685 6.65685 8 5 8C3.34315 8 2 6.65685 2 5ZM2 9.99996C2 9.44767 2.44772 8.99996 3 8.99996H7C7.55228 8.99996 8 9.44767 8 9.99996V21C8 21.5522 7.55228 22 7 22H3C2.44772 22 2 21.5522 2 21V9.99996ZM10 10C10 9.44772 10.4477 9 11 9H15C15.5523 9 16 9.44772 16 10V11.2384C16.8492 9.87228 18.423 9 20.125 9C23.0119 9 24.5 10.8711 24.5 13.9714V21C24.5 21.5523 24.0523 22 23.5 22H19.5C18.9477 22 18.5 21.5523 18.5 21V14.85C18.5 13.38 17.65 12.45 16.5 12.45C15.35 12.45 14.5 13.38 14.5 14.85V21C14.5 21.5523 14.0523 22 13.5 22H10.5C9.94772 22 9.5 21.5523 9.5 21V10C9.5 9.44772 9.94772 9 10 9Z" fill="currentColor" />
  </svg>
);
