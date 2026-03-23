import Link from "next/link";

export default function Footer() {
	return (
		<footer className="shrink-0 bg-white border-t border-gray-200 px-8 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-text-main/50">
			<p>&copy; {new Date().getFullYear()} Devakorn Creator AI. All rights reserved.</p>
			<div className="flex items-center gap-4 mt-2 md:mt-0">
				<Link href="/privacy" className="hover:text-dark-bg hover:font-bold transition-all">Privacy Policy</Link>
				<Link href="/terms" className="hover:text-dark-bg hover:font-bold transition-all">Terms of Service</Link>
				<Link href="/support" className="hover:text-dark-bg hover:font-bold transition-all">Support</Link>
			</div>
		</footer>
	);
}