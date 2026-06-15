import * as React from "react";
import { cn } from "@/lib/utils.ts";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			className={cn(
				"flex h-12 w-full rounded-lg border border-neutral-300 bg-white px-4 text-base shadow-sm outline-none transition-colors",
				"placeholder:text-neutral-400 focus-visible:border-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-200",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
