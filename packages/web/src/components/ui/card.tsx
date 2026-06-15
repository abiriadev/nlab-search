import * as React from "react";
import { cn } from "@/lib/utils.ts";

function Card({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"rounded-lg border border-neutral-200 bg-white text-neutral-950 shadow-sm",
				className,
			)}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
	return <div className={cn("p-4", className)} {...props} />;
}

export { Card, CardContent };
