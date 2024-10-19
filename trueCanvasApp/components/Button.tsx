import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  href: string;
  variant: 'primary' | 'secondary';
}

const Button = ({ children, href, variant }: ButtonProps) => {
  const baseClasses = "px-4 py-2 rounded font-semibold transition-colors";
  const variantClasses = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white",
  };

  return (
    <Link href={href} className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </Link>
  );
};

export default Button;