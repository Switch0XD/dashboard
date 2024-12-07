import React, { useState } from "react";
import { Sidebar } from "./components/sidebar.tsx";
import { ReturnOrder } from "./components/returnOrder.tsx";
import { ReturnRequests } from "./components/returnRequest.tsx";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState<"order" | "requests">("order");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Return Management
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    className={`${
                      activeTab === "order"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    onClick={() => setActiveTab("order")}
                  >
                    Return Order
                  </button>
                  <button
                    className={`${
                      activeTab === "requests"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ml-8`}
                    onClick={() => setActiveTab("requests")}
                  >
                    Return Requests
                  </button>
                </nav>
              </div>
              {activeTab === "order" ? <ReturnOrder /> : <ReturnRequests />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
