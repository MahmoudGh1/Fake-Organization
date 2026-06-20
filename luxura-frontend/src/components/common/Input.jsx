import React from "react";

export const Input = React.forwardRef(({ label, type = "text", error, icon: Icon, placeholder, className = "", ...props }, ref) => {
	return (
		<div className="space-y-1.5 w-full">
			{label && <label className="text-[11px] font-bold uppercase tracking-wider text-luxury-dark/80 block">{label}</label>}
			<div className="relative">
				{Icon && <Icon className="absolute left-3 top-3.5 text-luxury-muted w-4 h-4" />}
				<input type={type} ref={ref} placeholder={placeholder} className={`w-full h-11 bg-luxury-bg border ${error ? "border-red-500 focus:border-red-500" : "border-luxury-dark/10 focus:border-luxury-gold"} ${Icon ? "pl-10" : "px-4"} pr-4 text-xs rounded focus:outline-none transition-colors text-luxury-dark font-medium ${className}`} {...props} />
			</div>
			{error && <p className="text-[10px] text-red-600 font-medium tracking-wide">⚠️ {error}</p>}
		</div>
	);
});

Input.displayName = "Input";
