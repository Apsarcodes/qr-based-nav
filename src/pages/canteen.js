import { Link } from "react-router-dom";

export default function Canteen() {
  return (
    <div className="min-h-screen flex flex-col px-4 py-6 md:px-6 bg-gray-50">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {/* Main card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Canteen</h1>
          <p className="text-gray-600">Your current location. Get directions to other campus buildings from the navigation above.</p>
        </div>

        {/* Quick Links */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link 
              to="/library" 
              className="px-4 py-3 bg-blue-600 text-white text-center font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              → Library
            </Link>
            <Link 
              to="/einstein" 
              className="px-4 py-3 bg-blue-600 text-white text-center font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              → Einstein Block
            </Link>
            <Link 
              to="/newton" 
              className="px-4 py-3 bg-blue-600 text-white text-center font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              → Newton Block
            </Link>
            <Link 
              to="/admin" 
              className="px-4 py-3 bg-blue-600 text-white text-center font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              → Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
