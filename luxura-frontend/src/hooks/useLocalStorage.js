import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue) {
	const [value, setValue] = useState(() => {
		try {
			const jsonValue = localStorage.getItem(key);
			if (jsonValue != null) return JSON.parse(jsonValue);
		} catch (e) {
			console.error("Local storage allocation fault:", e);
		}

		if (typeof initialValue === "function") {
			return initialValue();
		} else {
			return initialValue;
		}
	});

	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);

	return [value, setValue];
}
