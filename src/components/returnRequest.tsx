import React, { useState, useEffect, useMemo } from "react";
import {
  MicroscopeIcon as MagnifyingGlassIcon,
  FilterIcon as FunnelIcon,
  MoreVertical,
  Plus,
} from "lucide-react";
import {
  collection,
  query,
  getDocs,
  orderBy,
  startAt,
  endAt,
} from "firebase/firestore";
import { db } from "../firebase/firebaseServices.ts";
import { useDebounce } from "../hooks/useDebounce.ts";

interface ReturnRequest {
  id: string;
  distributor: string;
  iolModel: string;
  diopter: string;
  cylinder: string | "NA";
  serialNumber: string;
  createdOn: {
    date: string;
    time: string;
  };
}

type SortField = "distributor" | "createdOn" | "serialNumber";
type SortOrder = "asc" | "desc";

export const ReturnRequests: React.FC = () => {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    order: SortOrder;
  }>({
    field: "createdOn",
    order: "desc",
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch initial data
  useEffect(() => {
    const fetchRequests = async () => {
      const requestsRef = collection(db, "returnRequests");
      const q = query(requestsRef, orderBy("createdOn", "desc"));
      const snapshot = await getDocs(q);
      const fetchedRequests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ReturnRequest[];
      setRequests(fetchedRequests);
    };
    fetchRequests();
  }, []);

  // Handle search with suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      const requestsRef = collection(db, "returnRequests");
      const q = query(
        requestsRef,
        orderBy("serialNumber"),
        startAt(debouncedSearchTerm),
        endAt(debouncedSearchTerm + "\uf8ff")
      );

      const snapshot = await getDocs(q);
      const fetchedSuggestions = snapshot.docs
        .map((doc) => doc.data().serialNumber as string)
        .filter((value, index, self) => self.indexOf(value) === index)
        .slice(0, 5);

      setSuggestions(fetchedSuggestions);
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  // Sort functionality
  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      const { field, order } = sortConfig;
      let comparison = 0;

      if (field === "createdOn") {
        const dateA = new Date(`${a.createdOn.date} ${a.createdOn.time}`);
        const dateB = new Date(`${b.createdOn.date} ${b.createdOn.time}`);
        comparison = dateA.getTime() - dateB.getTime();
      } else {
        comparison = a[field].localeCompare(b[field]);
      }

      return order === "asc" ? comparison : -comparison;
    });
  }, [requests, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig((current) => ({
      field,
      order:
        current.field === field && current.order === "asc" ? "desc" : "asc",
    }));
  };

  const handleCheckboxChange = (requestId: string) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRequests(
      e.target.checked ? requests.map((request) => request.id) : []
    );
  };

  const filteredRequests = sortedRequests.filter((request) =>
    Object.values(request).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  );

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Search and Filters */}
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setSearchTerm(suggestion);
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <FunnelIcon className="h-4 w-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  onChange={handleSelectAll}
                  checked={selectedRequests.length === requests.length}
                />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("distributor")}
              >
                Distributor
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                IOL Model
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Diopter
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Cylinder
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("serialNumber")}
              >
                Serial Number
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("createdOn")}
              >
                Created On
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedRequests.includes(request.id)}
                    onChange={() => handleCheckboxChange(request.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.distributor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.iolModel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.diopter}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.cylinder}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.serialNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{request.createdOn.date}</div>
                  <div className="text-xs text-gray-400">
                    {request.createdOn.time}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <div className="relative">
                      <button
                        className="p-1 rounded-md hover:bg-gray-100"
                        onClick={() =>
                          setActiveActionMenu(
                            activeActionMenu === request.id ? null : request.id
                          )
                        }
                      >
                        <Plus className="h-4 w-4 text-gray-400" />
                      </button>
                      {activeActionMenu === request.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                          <div className="py-1">
                            <button
                              className="w-full px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 flex items-center"
                              onClick={() => setActiveActionMenu(null)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              New Return Order
                            </button>
                            <button
                              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              onClick={() => setActiveActionMenu(null)}
                            >
                              Existing Return Order
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        className="p-1 rounded-md hover:bg-gray-100"
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === request.id ? null : request.id
                          )
                        }
                      >
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                      {activeDropdown === request.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                          <div className="py-1">
                            {/* Dropdown menu items would go here */}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
