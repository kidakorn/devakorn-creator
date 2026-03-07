export default function Footer() {
	return (
		<footer className="shrink-0 bg-white border-t border-gray-200 px-8 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-text-main/50">
			<p>&copy; {new Date().getFullYear()} Devakorn Creator AI. All rights reserved.</p>
			<div className="flex items-center gap-4 mt-2 md:mt-0">
				<a href="#" className="hover:text-dark-bg transition-colors">Privacy Policy</a>
				<a href="#" className="hover:text-dark-bg transition-colors">Terms of Service</a>
				<a href="#" className="hover:text-dark-bg transition-colors">Support</a>
			</div>
		</footer>
	);
}