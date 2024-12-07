import React, { useState, useEffect, useMemo } from "react";
import {
  MicroscopeIcon as MagnifyingGlassIcon,
  FilterIcon as FunnelIcon,
  MoreVertical,
  Upload,
  Download,
  Printer,
  Mail,
  Trash2,
} from "lucide-react";
import {
  collection,
  query,
  getDocs,
  orderBy,
  startAt,
  endAt,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseServices.ts";
import { useDebounce } from "../hooks/useDebounce.ts";
import { Timestamp } from "firebase/firestore";

interface ReturnOrder {
  id: string;
  orderId: string;
  distributor: string;
  createdOn: {
    date: string;
    time: string;
  };
  noOfItems: string;
  status: "Draft" | "Return Order created" | "Pending Delivery" | "Delivered";
}

type SortField = "distributor" | "createdOn" | "orderId";
type SortOrder = "asc" | "desc";

export const ReturnOrder: React.FC = () => {
  const [orders, setOrders] = useState<ReturnOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    order: SortOrder;
  }>({
    field: "createdOn",
    order: "desc",
  });
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch initial data
  useEffect(() => {
    const fetchOrders = async () => {
      const ordersRef = collection(db, "returnOrder");
      let q = query(ordersRef, orderBy("createdOn", "desc"));

      if (statusFilter) {
        q = query(q, where("status", "==", statusFilter));
      }

      const snapshot = await getDocs(q);
      const fetchedOrders = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdOn =
          data.createdOn instanceof Timestamp
            ? data.createdOn.toDate()
            : new Date();

        return {
          id: doc.id,
          orderId: data.orderId,
          distributor: data.distributor,
          createdOn: {
            date: createdOn.toLocaleDateString(),
            time: createdOn.toLocaleTimeString(),
          },
          noOfItems: data.noOfItems,
          status: data.status,
        } as ReturnOrder;
      });

      setOrders(fetchedOrders);
    };
    fetchOrders();
  }, [statusFilter]);

  // Handle search with suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      const ordersRef = collection(db, "returnOrder");
      const q = query(
        ordersRef,
        orderBy("orderId"),
        startAt(debouncedSearchTerm),
        endAt(debouncedSearchTerm + "\uf8ff")
      );

      const snapshot = await getDocs(q);
      const fetchedSuggestions = snapshot.docs
        .map((doc) => doc.data().orderId as string)
        .filter((value, index, self) => self.indexOf(value) === index)
        .slice(0, 5);

      setSuggestions(fetchedSuggestions);
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  // Sort functionality
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
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
  }, [orders, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig((current) => ({
      field,
      order:
        current.field === field && current.order === "asc" ? "desc" : "asc",
    }));
  };

  const handleCheckboxChange = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOrders(e.target.checked ? orders.map((order) => order.id) : []);
  };

  const filteredOrders = sortedOrders.filter((order) =>
    Object.values(order).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  );

  const getStatusBadgeClass = (status: ReturnOrder["status"]) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Return Order created":
        return "bg-orange-100 text-orange-800";
      case "Pending Delivery":
        return "bg-blue-100 text-blue-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Search and Filters */}
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Quick Filters</span>
          <button
            className={`px-3 py-1 text-sm rounded-full ${
              statusFilter === "Draft"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
            onClick={() =>
              setStatusFilter(statusFilter === "Draft" ? null : "Draft")
            }
          >
            Draft
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
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
                  checked={selectedOrders.length === orders.length}
                />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Order ID
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
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("createdOn")}
              >
                Created On
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                No. of items
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => handleCheckboxChange(order.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.orderId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.distributor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{order.createdOn.date}</div>
                  <div className="text-xs text-gray-400">
                    {order.createdOn.time}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.noOfItems}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    {order.status === "Return Order created" && (
                      <button className="text-blue-600 text-xs hover:text-blue-800">
                        Mark as sent
                      </button>
                    )}
                    {order.status === "Pending Delivery" && (
                      <button className="px-3 py-1 text-xs text-white bg-blue-900 rounded-md hover:bg-blue-800">
                        Track Order
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative">
                    <button
                      className="p-1 rounded-md hover:bg-gray-100"
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === order.id ? null : order.id
                        )
                      }
                    >
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                    {activeDropdown === order.id && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
                            <Upload className="h-4 w-4 mr-3" />
                            Upload Document
                          </button>
                          <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
                            <Download className="h-4 w-4 mr-3" />
                            Download PDF
                          </button>
                          <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
                            <Printer className="h-4 w-4 mr-3" />
                            Send Fax
                          </button>
                          <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
                            <Mail className="h-4 w-4 mr-3" />
                            Send Email
                          </button>
                          <button className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full">
                            <Trash2 className="h-4 w-4 mr-3" />
                            Delete Item
                          </button>
                        </div>
                      </div>
                    )}
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
