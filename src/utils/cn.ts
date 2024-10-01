export default function cn(
	...classes: (string | undefined | boolean | null)[]
): string {
	return classes.filter(Boolean).join(" ");
}
