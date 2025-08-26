import { ReactNode } from "react";

export function IconButton({
    icon, 
    onClick, 
    activated,
    title,
    className = ""
}: {
    icon: ReactNode,
    onClick: () => void,
    activated: boolean,
    title?: string,
    className?: string
}) {
    return (
        <button 
            className={`group relative p-3 rounded-xl transition-all duration-200 ${
                activated
                    ? 'bg-blue-100 text-blue-600 shadow-md border-2 border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 border-2 border-transparent'
            } ${className}`}
            onClick={onClick}
            title={title}
        >
            {icon}
            
            {/* Tooltip */}
            {title && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {title}
                </div>
            )}
        </button>
    );
}
