/**
 * Formats an integer/float input into localized premium luxury currency strings.
 */
export const formatCurrency = (amount) => {
	if (isNaN(amount)) return "$0.00";
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(amount);
};

/**
 * Normalizes ISO date timestamps into clean corporate billing cycles.
 */
export const formatDate = (isoString) => {
	if (!isoString) return "N/A";
	const date = new Date(isoString);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};
