import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
	const { pathname, hash } = useLocation();

	useEffect(() => {
		if (!hash) {
			window.scrollTo({ top: 0, left: 0, behavior: "instant" });
			if (
				window.lenisInstance &&
				typeof window.lenisInstance.scrollTo === "function"
			) {
				window.lenisInstance.scrollTo(0, { immediate: true });
			}
		}
	}, [pathname, hash]);

	return null;
}
