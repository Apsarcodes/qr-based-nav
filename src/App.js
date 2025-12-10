import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import "./App.css";

const CAMPUS_DESTINATIONS = {
  "CS-2-201": {
    code: "CS-2-201",
    name: "Computer Science Block",
    floor: 2,
    room: "201",
    building: "Computer Science",
    label: "CS • Floor 2 • Room 201",
    coords: { x: 120, y: 160 },
    tags: ["labs", "cs", "popular"],
  },
  "LIB-1-101": {
    code: "LIB-1-101",
    name: "Central Library",
    floor: 1,
    room: "101",
    building: "Library",
    label: "Library • Floor 1 • Front Desk",
    coords: { x: 280, y: 120 },
    tags: ["study", "popular"],
  },
  "EIN-3-305": {
    code: "EIN-3-305",
    name: "Einstein Block",
    floor: 3,
    room: "305",
    building: "Physics",
    label: "Einstein • Floor 3 • Lab 305",
    coords: { x: 180, y: 70 },
    tags: ["labs", "physics"],
  },
  "NEW-1-102": {
    code: "NEW-1-102",
    name: "Newton Block",
    floor: 1,
    room: "102",
    building: "Mathematics",
    label: "Newton • Floor 1 • Room 102",
    coords: { x: 360, y: 210 },
    tags: ["math"],
  },
  "ADM-1-001": {
    code: "ADM-1-001",
    name: "Admin Block",
    floor: 1,
    room: "001",
    building: "Admin",
    label: "Admin • Reception",
    coords: { x: 70, y: 90 },
    tags: ["services"],
  },
  "CANT-1-010": {
    code: "CANT-1-010",
    name: "Canteen",
    floor: 1,
    room: "010",
    building: "Canteen",
    label: "Canteen • Dining Hall",
    coords: { x: 220, y: 240 },
    tags: ["food", "popular"],
  },
};

const ROOM_OUTLINES = [
  { name: "Library", x: 240, y: 80, w: 110, h: 90 },
  { name: "CS Block", x: 80, y: 130, w: 110, h: 80 },
  { name: "Einstein", x: 150, y: 40, w: 100, h: 60 },
  { name: "Newton", x: 320, y: 180, w: 110, h: 80 },
  { name: "Canteen", x: 180, y: 210, w: 80, h: 70 },
  { name: "Admin", x: 40, y: 60, w: 80, h: 70 },
];

const defaultCode = "CS-2-201";

function parseLocationCode(raw) {
  if (!raw) return null;
  const normalized = raw.trim().toUpperCase();
  const [building, floor, room] = normalized.split("-");
  if (!building || !floor || !room) return null;
  const code = `${building}-${floor}-${room}`;
  const known = CAMPUS_DESTINATIONS[code];
  return (
    known || {
      code,
      name: building,
      building,
      floor: Number(floor) || floor,
      room,
      label: `${building} • Floor ${floor} • Room ${room}`,
      coords: { x: 60 + Math.random() * 320, y: 60 + Math.random() * 180 },
      tags: ["scanned"],
    }
  );
}

function buildSteps(from, to) {
  if (!from || !to) return [];
  const steps = [
    `Start at ${from.name} (Floor ${from.floor}, Room ${from.room}).`,
  ];
  if (from.building !== to.building) {
    steps.push(
      `Walk towards ${to.building} building following the main corridor.`
    );
  }
  if (from.floor !== to.floor) {
    steps.push(
      `Take the stairs/elevator to Floor ${to.floor} of ${to.building}.`
    );
  }
  steps.push(
    `Proceed to Room ${to.room} on Floor ${to.floor} inside ${to.name}.`
  );
  steps.push("You have arrived at your destination.");
  return steps;
}

function buildPath(from, to) {
  if (!from || !to) return [];
  const midX = (from.coords.x + to.coords.x) / 2;
  const midY = (from.coords.y + to.coords.y) / 2;
  return [
    { x: from.coords.x, y: from.coords.y },
    { x: midX, y: from.coords.y },
    { x: midX, y: to.coords.y },
    { x: to.coords.x, y: to.coords.y },
  ];
}

function pointAtProgress(path, t) {
  if (!path || path.length < 2) return { x: 0, y: 0 };
  const total = path.slice(1).reduce((acc, p, i) => {
    const dx = p.x - path[i].x;
    const dy = p.y - path[i].y;
    return acc + Math.hypot(dx, dy);
  }, 0);
  let target = total * t;
  for (let i = 1; i < path.length; i += 1) {
    const start = path[i - 1];
    const end = path[i];
    const seg = Math.hypot(end.x - start.x, end.y - start.y);
    if (target <= seg) {
      const ratio = seg === 0 ? 0 : target / seg;
      return {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      };
    }
    target -= seg;
  }
  return path[path.length - 1];
}

function MapCanvas({ path, progress, current, destination }) {
  const ref = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    // make canvas responsive to container width while keeping 16:10-ish ratio
    const width = wrapper.clientWidth || 520;
    const height = Math.max(260, Math.round(width * 0.6));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const ctx = canvas.getContext("2d");
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // background
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // grid
      ctx.strokeStyle = "rgba(15,23,42,0.06)";
      for (let i = 20; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 20; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // rooms
      ROOM_OUTLINES.forEach((r) => {
        ctx.fillStyle = "rgba(30,58,138,0.06)";
        ctx.strokeStyle = "rgba(30,58,138,0.28)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(r.x, r.y, r.w, r.h, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#1e3a8a";
        ctx.font = "12px 'Inter', system-ui";
        ctx.fillText(r.name, r.x + 8, r.y + 16);
      });

      // path
      if (path && path.length > 1) {
        ctx.strokeStyle = "#1e3a8a";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        path.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }

      // destination marker
      if (destination?.coords) {
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(destination.coords.x, destination.coords.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1e3a8a";
        ctx.beginPath();
        ctx.arc(destination.coords.x, destination.coords.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // user position
      const pos = pointAtProgress(path, progress);
      ctx.fillStyle = "#2563eb";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(37,99,235,0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
      ctx.stroke();
    };

    draw();
  }, [path, progress, current, destination]);

  return (
    <div ref={wrapperRef} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
      <canvas ref={ref} />
    </div>
  );
}

function DestinationSelector({ currentCode, destinationCode, setDestinationCode, onStart, destinations }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const list = useMemo(() => {
    return Object.values(destinations)
      .filter((d) => d.code !== currentCode)
      .filter((d) => (filter === "all" ? true : d.building === filter))
      .filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.code.toLowerCase().includes(search.toLowerCase())
      );
  }, [search, filter, currentCode, destinations]);

  const buildings = Array.from(new Set(Object.values(destinations).map((d) => d.building)));

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Destination selector</p>
          <h2 className="text-xl font-semibold text-blue-900">Where do you want to go next?</h2>
        </div>
        <div className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700">{list.length} options</div>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <input
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Search building or code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === "all" ? "bg-yellow-400 text-blue-900" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          {buildings.map((b) => (
            <button
              key={b}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filter === b ? "bg-yellow-400 text-blue-900" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setFilter(b)}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {list.map((dest) => (
          <button
            key={dest.code}
            className={`w-full text-left p-4 border rounded-lg transition-all ${
              destinationCode === dest.code
                ? "border-yellow-400 bg-yellow-50"
                : "border-gray-200 hover:border-yellow-400 hover:bg-yellow-50"
            }`}
            onClick={() => setDestinationCode(dest.code)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                <p className="text-xs text-gray-500">{dest.code}</p>
                <div className="text-lg font-semibold text-blue-900">{dest.name}</div>
                <div className="text-sm text-gray-600">{dest.label}</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700">Floor {dest.floor}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {dest.tags?.map((t) => (
                <span key={t} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                  {t}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 stack-sm">
        <button className="bg-yellow-400 text-blue-900 px-5 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors sm:w-auto w-full" onClick={onStart}>
          Start navigation
        </button>
      </div>
    </div>
  );
}

function ScannerCard({ onScan, onSimulate, scanValue, setScanValue, cameraEnabled, setCameraEnabled, status }) {
  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const boxRef = useRef(null);
  const [boxHeight, setBoxHeight] = useState(260);

  useEffect(() => {
    const handleResize = () => {
      if (!boxRef.current) return;
      const w = boxRef.current.clientWidth || 320;
      const h = Math.min(420, Math.max(200, Math.round(w * 0.65)));
      setBoxHeight(h);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!cameraEnabled) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      cancelAnimationFrame(rafRef.current);
      return;
    }

    let active = true;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if ("BarcodeDetector" in window) {
          detectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });
          const tick = async () => {
            if (!active || !videoRef.current || !detectorRef.current) return;
            try {
              const codes = await detectorRef.current.detect(videoRef.current);
              if (codes.length > 0) {
                onScan(codes[0].rawValue);
              }
            } catch (err) {
              // ignore detection errors
            }
            rafRef.current = requestAnimationFrame(tick);
          };
          tick();
        }
      } catch (err) {
        console.error("Camera error", err);
      }
    }
    startCamera();

    return () => {
      active = false;
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(rafRef.current);
    };
  }, [cameraEnabled, onScan]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">QR Scanner</p>
          <h2 className="text-xl font-semibold text-blue-900">Scan your location</h2>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${status === "Ready" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
          {status}
        </div>
      </div>

      <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 mb-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/60 to-white/80" />
        <div className="relative">
          <div
            ref={boxRef}
            className="w-full bg-white rounded-lg border border-gray-200 flex items-center justify-center"
            style={{ height: boxHeight }}
          >
            {cameraEnabled ? (
              <video ref={videoRef} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 gap-3">
                <div className="w-40 h-40 border-4 border-yellow-400 rounded-xl"></div>
                <p className="text-sm text-gray-600">Point camera at campus QR code</p>
              </div>
            )}
          </div>
          <div className="mt-3 stack-sm">
            <button
              className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors sm:w-auto w-full"
              onClick={onSimulate}
            >
              Simulate QR Scan
            </button>
            <button
              className={`px-4 py-2 rounded-lg border font-semibold transition-colors sm:w-auto w-full ${
                cameraEnabled ? "bg-blue-900 text-white border-blue-900" : "bg-white text-blue-900 border-gray-300"
              }`}
              onClick={() => setCameraEnabled((v) => !v)}
            >
              {cameraEnabled ? "Stop camera" : "Scan with camera"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">QR Code (BUILDING-FLOOR-ROOM)</label>
        <div className="stack-sm">
          <input
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={scanValue}
            onChange={(e) => setScanValue(e.target.value)}
            placeholder="CS-2-201"
          />
          <button
            className="px-5 py-3 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors sm:w-auto w-full"
            onClick={() => onScan(scanValue)}
          >
            Set location
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Uses codes like "CS-2-201". Camera scanning uses the built-in BarcodeDetector when available; otherwise, type the code or use simulate.
        </p>
      </div>
    </div>
  );
}

function NavigationPanel({ steps, stepIndex, progress, voiceEnabled, setVoiceEnabled }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Live navigation</p>
          <h2 className="text-xl font-semibold text-blue-900">Guidance & progress</h2>
        </div>
        <div className="flex flex-col items-end gap-1">
          <label className="text-xs text-gray-500">Voice</label>
          <button
            className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${
              voiceEnabled ? "bg-yellow-100 text-yellow-700 border-yellow-300" : "bg-gray-100 text-gray-700 border-gray-200"
            }`}
            onClick={() => setVoiceEnabled((v) => !v)}
          >
            {voiceEnabled ? "On" : "Off"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">Step {Math.min(stepIndex + 1, steps.length)} of {steps.length}</p>

      <div className="space-y-2">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`flex gap-3 p-3 rounded-lg border ${
              i === stepIndex
                ? "border-blue-500 bg-blue-50"
                : i < stepIndex
                ? "border-green-500 bg-green-50 opacity-80"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full grid place-items-center font-semibold ${
                i === stepIndex
                  ? "bg-blue-600 text-white"
                  : i < stepIndex
                  ? "bg-green-600 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {i + 1}
            </div>
            <div className="text-sm text-gray-800">{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArrivalCard({ destination, onNext, onRescan }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-md text-center">
      <div className="w-12 h-12 rounded-full bg-yellow-400 text-blue-900 font-bold grid place-items-center mx-auto mb-3">✓</div>
      <h2 className="text-2xl font-semibold text-yellow-900 mb-2">You've Arrived!</h2>
      <p className="text-gray-700 mb-4">
        {destination ? `You are now at ${destination.name}, Floor ${destination.floor}, Room ${destination.room}.` : "Destination reached."}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button className="bg-yellow-400 text-blue-900 px-5 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors" onClick={onNext}>
          Navigate to Next Destination
        </button>
        <button className="bg-blue-900 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors" onClick={onRescan}>
          Scan New Location
        </button>
      </div>
    </div>
  );
}

function TopNav() {
  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="font-semibold text-blue-900">QRNavi</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <Link to="/" className="hover:text-blue-900">Home</Link>
          <Link to="/campus" className="hover:text-blue-900">Campus Info</Link>
          <Link to="/help" className="hover:text-blue-900">Help</Link>
        </div>
      </div>
    </nav>
  );
}

function CampusPage() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">Campus Info</h2>
        <p className="text-gray-600">Browse buildings and QR formats used on campus.</p>
        <ul className="text-gray-700 mt-3 space-y-2">
          <li>QR format: <strong>BUILDING-FLOOR-ROOM</strong> (e.g., CS-2-201).</li>
          <li>Popular buildings: CS, LIB, EIN, NEW, ADM, CANT.</li>
          <li>Use “Simulate QR Scan” to quickly set Computer Science Floor 2 Room 201.</li>
        </ul>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Tips</h3>
        <ul className="text-gray-700 space-y-2">
          <li>Allow camera access for live QR scanning.</li>
          <li>Use “Navigate to Next Destination” to chain hops without rescanning.</li>
          <li>Voice guidance can be toggled in the navigation panel.</li>
        </ul>
      </div>
    </div>
  );
}

function HelpPage() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">Help & FAQs</h2>
        <ul className="text-gray-700 space-y-2">
          <li><strong>How do I set my location?</strong> Scan the QR at your spot or simulate CS-2-201.</li>
          <li><strong>Can I keep navigating without rescanning?</strong> Yes—tap “Navigate to Next Destination” after arrival.</li>
          <li><strong>Why no camera preview?</strong> Check browser permissions; you can still type the code.</li>
        </ul>
      </div>
    </div>
  );
}

function HomePage(props) {
  const [scanValue, setScanValue] = useState(defaultCode);
  const [current, setCurrent] = useState(parseLocationCode(defaultCode));
  const [destinationCode, setDestinationCode] = useState("LIB-1-101");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [arrivalVisible, setArrivalVisible] = useState(false);
  const [nav, setNav] = useState({
    status: "idle",
    steps: [],
    stepIndex: 0,
    progress: 0,
    path: [],
  });

  const destination = CAMPUS_DESTINATIONS[destinationCode];

  const speak = useCallback((text) => {
    if (!voiceEnabled) return;
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [voiceEnabled]);

  const handleScan = (raw) => {
    const parsed = parseLocationCode(raw);
    if (!parsed) return;
    setScanValue(parsed.code);
    setCurrent(parsed);
    setArrivalVisible(false);
    setNav((prev) => ({ ...prev, status: "idle", progress: 0, stepIndex: 0, path: [] }));
  };

  const startNavigation = () => {
    if (!destination || !current) return;
    const steps = buildSteps(current, destination);
    const path = buildPath(current, destination);
    setArrivalVisible(false);
    setNav({
      status: "navigating",
      steps,
      stepIndex: 0,
      progress: 0,
      path,
    });
    speak(steps[0]);
  };

  useEffect(() => {
    if (nav.status !== "navigating") return undefined;
    const id = setInterval(() => {
      setNav((prev) => {
        const nextProgress = Math.min(100, prev.progress + 8);
        const stepAt = Math.min(
          prev.steps.length - 1,
          Math.floor((nextProgress / 100) * prev.steps.length)
        );
        if (stepAt !== prev.stepIndex && prev.steps[stepAt]) {
          speak(prev.steps[stepAt]);
        }
        if (nextProgress >= 100) {
          return { ...prev, progress: 100, stepIndex: prev.steps.length - 1, status: "arrived" };
        }
        return { ...prev, progress: nextProgress, stepIndex: stepAt };
      });
    }, 1200);
    return () => clearInterval(id);
  }, [nav.status, speak]);

  useEffect(() => {
    if (nav.status === "arrived") {
      setArrivalVisible(true);
      speak("You have arrived. Would you like to continue to another destination?");
    }
  }, [nav.status, speak]);

  const handleNextHop = () => {
    if (!destination) return;
    setCurrent(destination);
    setScanValue(destination.code);
    setArrivalVisible(false);
    setNav({
      status: "idle",
      steps: [],
      stepIndex: 0,
      progress: 0,
      path: [],
    });
  };

  const progress = nav.progress;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto px-page py-5 space-y-3">
        <header className="bg-blue-900 text-white header-compact shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-wide text-blue-100">SKCET Campus</p>
            <h1 className="text-lg-mobile text-white leading-tight">QRNavi Scan &amp; Go</h1>
            <p className="text-blue-100 mt-1 text-balance">
              Indoor navigation with QR-powered location, chained destinations, text + voice guidance, and a live indoor map.
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 min-w-[200px] text-center md:text-left">
            <p className="text-xs text-blue-100">Current location</p>
            <div className="text-lg font-semibold">{current?.name || "Unknown"}</div>
            <div className="text-sm text-blue-100">{current?.label}</div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          <div className="page-section">
            <ScannerCard
              onScan={handleScan}
              onSimulate={() => handleScan(defaultCode)}
              scanValue={scanValue}
              setScanValue={setScanValue}
              cameraEnabled={cameraEnabled}
              setCameraEnabled={setCameraEnabled}
              status={current ? "Ready" : "Need scan"}
            />
            <DestinationSelector
              currentCode={current?.code}
              destinationCode={destinationCode}
              setDestinationCode={setDestinationCode}
              onStart={startNavigation}
              destinations={CAMPUS_DESTINATIONS}
            />
          </div>

          <div className="page-section">
            <div className="card-mobile">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Visual map</p>
                  <h2 className="text-xl font-semibold text-blue-900">See your path</h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700">
                  {nav.status === "arrived" ? "Arrived" : nav.status === "navigating" ? "On the move" : "Ready"}
                </div>
              </div>
              <MapCanvas
                path={nav.path.length ? nav.path : buildPath(current, destination)}
                progress={nav.status === "arrived" ? 1 : progress / 100}
                current={current}
                destination={destination}
              />
              <div className="flex gap-3 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-600" /> You</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400" /> Destination</span>
                <span className="flex items-center gap-2"><span className="w-6 h-[3px] bg-blue-900" /> Route</span>
              </div>
            </div>

            <NavigationPanel
              steps={nav.steps.length ? nav.steps : buildSteps(current, destination)}
              stepIndex={nav.stepIndex}
              progress={progress}
              voiceEnabled={voiceEnabled}
              setVoiceEnabled={setVoiceEnabled}
            />

            {arrivalVisible && (
              <ArrivalCard
                destination={destination}
                onNext={handleNextHop}
                onRescan={() => {
                  setArrivalVisible(false);
                  setNav({ status: "idle", steps: [], stepIndex: 0, progress: 0, path: [] });
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <TopNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/campus" element={<CampusPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
