import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import directions from "../directions";

export default function Navigation({ from, to, setFrom, setTo, dirOpen, setDirOpen, setDirPanelHeight, setShowDirections }) {
	// provide safe defaults to avoid runtime errors if props are missing
	setFrom = setFrom || (()=>{});
	setTo = setTo || (()=>{});
	setDirOpen = setDirOpen || (()=>{});
	setDirPanelHeight = setDirPanelHeight || (()=>{});
	setShowDirections = setShowDirections || (()=>{});

	const [open, setOpen] = useState(false);
	const places = useMemo(() => Object.keys(directions), []);
	const panelRef = useRef(null);

	useEffect(() => {
		try {
			// measure panel height when opened
			if (panelRef.current && setDirPanelHeight) {
				// If the ref points at the panel, use it directly; otherwise try to find .dir-panel inside
				const panel = panelRef.current.querySelector?.('.dir-panel') || panelRef.current;
				const h = panel ? (panel.offsetHeight || 0) : 0;
				setDirPanelHeight(h);
			}
			if (!dirOpen && setDirPanelHeight) setDirPanelHeight(0);
		} catch (err) {
			// swallow measurement errors to avoid breaking the entire app
			// but log to console for debugging
			console.error('Error measuring dir panel:', err);
		}
	}, [dirOpen, setDirPanelHeight]);

	const handleCloseAll = () => {
		setOpen(false);
		setDirOpen(false);
	};

	return (
		<header className="flex flex-col bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
			{/* Top bar */}
			<div className="flex items-center justify-between px-4 py-3 md:px-6">
				<div className="flex items-center gap-2">
					<div className="text-lg font-bold text-blue-600">SKCET Nav</div>
					<span className="text-xs text-gray-500 hidden sm:inline">Campus Guide</span>
				</div>

				<div className="flex items-center gap-2 md:gap-4">
					{/* Desktop nav links */}
					<nav className="hidden md:flex gap-1">
						<Link to="/library" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Library</Link>
						<Link to="/einstein" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Einstein</Link>
						<Link to="/newton" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Newton</Link>
						<Link to="/canteen" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Canteen</Link>
						<Link to="/admin" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Admin</Link>
					</nav>

					{/* Get Directions button */}
					<button
						onClick={() => setDirOpen(!dirOpen)}
						className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
						aria-expanded={dirOpen}
					>
						{dirOpen ? '✕' : '⊕'} Directions
					</button>

					{/* Mobile menu toggle */}
					<button
						onClick={() => setOpen(!open)}
						className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
						aria-label="Toggle menu"
					>
						{open ? '✕' : '≡'}
					</button>
				</div>
			</div>

			{/* Directions panel (desktop) */}
			{dirOpen && !open && (
				<div className="hidden md:block border-t border-gray-200 bg-gray-50 p-4">
					<div className="flex gap-3 items-end max-w-4xl mx-auto">
						<div>
							<label className="block text-xs font-semibold text-gray-600 mb-1">From</label>
							<select
								value={from}
								onChange={(e) => setFrom(e.target.value)}
								className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
							>
								{places.map(p => (
									<option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
								))}
							</select>
						</div>

						<div>
							<label className="block text-xs font-semibold text-gray-600 mb-1">To</label>
							<select
								value={to}
								onChange={(e) => setTo(e.target.value)}
								className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
							>
								{places.map(p => (
									<option key={p} value={p} disabled={p === from}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
								))}
							</select>
						</div>

						<button
							onClick={() => setShowDirections(true)}
							className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
						>
							Show
						</button>
					</div>
				</div>
			)}

			{/* Mobile menu */}
			{open && (
				<div className="md:hidden border-t border-gray-200 bg-gray-50 py-2 px-4">
					<nav className="flex flex-col gap-1">
						<Link to="/library" onClick={handleCloseAll} className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg">Library</Link>
						<Link to="/einstein" onClick={handleCloseAll} className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg">Einstein</Link>
						<Link to="/newton" onClick={handleCloseAll} className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg">Newton</Link>
						<Link to="/canteen" onClick={handleCloseAll} className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg">Canteen</Link>
						<Link to="/admin" onClick={handleCloseAll} className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg">Admin</Link>
					</nav>
				</div>
			)}

			{/* Mobile directions panel */}
			{dirOpen && open && (
				<div className="md:hidden border-t border-gray-200 bg-white p-4 space-y-3">
					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1">From</label>
						<select
							value={from}
							onChange={(e) => setFrom(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
						>
							{places.map(p => (
								<option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-xs font-semibold text-gray-600 mb-1">To</label>
						<select
							value={to}
							onChange={(e) => setTo(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
						>
							{places.map(p => (
								<option key={p} value={p} disabled={p === from}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
							))}
						</select>
					</div>

					<button
						onClick={() => setShowDirections(true)}
						className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
					>
						Show Directions
					</button>
				</div>
			)}

			{/* Overlay for mobile */}
			{(open || dirOpen) && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={handleCloseAll} />}
		</header>
	);
}
