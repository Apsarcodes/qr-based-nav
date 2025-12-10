import React, { useState, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import Navigation from "./components/Navigation";
import Directions from "./components/Directions";

import Library from "./pages/library";
import Einstein from "./pages/einstein";
import Newton from "./pages/newton";
import Canteen from "./pages/canteen";
import Admin from "./pages/admin";

export default function App() {
	const [from, setFrom] = useState("library");
	const [to, setTo] = useState("einstein");
	const [dirOpen, setDirOpen] = useState(false);
	const [dirPanelHeight, setDirPanelHeight] = useState(0);
	const [showDirections, setShowDirections] = useState(false);

	return (
		<Router>
			<Navigation
				from={from}
				to={to}
				setFrom={setFrom}
				setTo={setTo}
				dirOpen={dirOpen}
				setDirOpen={setDirOpen}
				setDirPanelHeight={setDirPanelHeight}
				setShowDirections={setShowDirections}
			/>

			<main
				style={{
					paddingTop: dirPanelHeight,
					transition: "padding-top 0.3s ease",
				}}
			>
				<Routes>
					<Route path="/library" element={<Library />} />
					<Route path="/einstein" element={<Einstein />} />
					<Route path="/newton" element={<Newton />} />
					<Route path="/canteen" element={<Canteen />} />
					<Route path="/admin" element={<Admin />} />
					<Route path="/" element={<Navigate to="/library" replace />} />
					<Route path="*" element={<Navigate to="/library" replace />} />
				</Routes>

				<Directions
					from={from}
					to={to}
					setFrom={setFrom}
					setTo={setTo}
					showDirections={showDirections}
					setShowDirections={setShowDirections}
				/>
			</main>
		</Router>
	);
}
