import React, { useEffect } from "react";
import { useAdmin } from "../../store/Hooks/Admin/useAdmin.js";

const UsersTab = () => {
  const { users, fetchUsers, ui } = useAdmin();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showUser, setShowUser] = React.useState([]);
  const [searchUser, setSearchUser] = React.useState("");

  const PAGE_SIZE = 10;
  const allUsers = users.list || [];

  // Filtered list derived from search term
  const filteredUsers = React.useMemo(() => {
    const term = (searchUser || "").trim().toLowerCase();
    if (!term) return allUsers;
    return allUsers.filter((user) =>
      (user.email || "").toLowerCase().includes(term)
    );
  }, [allUsers, searchUser]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  const handleSearch = (value) => {
    setSearchUser(value);
    // reset to first page whenever search changes
    setCurrentPage(1);
  };

  // React.useEffect(() => {
  //   if (users.list) {
  //     setAllUsers(users.list);
  //   }
  // }, [users]);

  useEffect(() => {
    // Fetch a larger page to enable client-side filtering
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = currentPage * PAGE_SIZE; // correct slice end index
    setShowUser(filteredUsers.slice(start, end));
    // Scroll to top whenever page changes
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, filteredUsers]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            User Management
          </h2>
          <p className="text-gray-600">
            Manage users, view profiles, and handle user-related operations.
          </p>
        </div>
        <button
          onClick={() => fetchUsers()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="mb-2">
        <input
          type="text"
          value={searchUser}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by email"
          className="px-4 py-2 border border-gray-300 rounded-md mr-2"
        />
      </div>

      {ui.errors.users && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            <span className="font-medium">Error:</span> {ui.errors.users}
          </p>
        </div>
      )}

      {ui.isLoading.users ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <div
              key={i}
              className="animate-pulse p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : showUser.length > 0 ? (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Users ({filteredUsers.length})
                </h3>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {showUser.map((user) => (
                <div key={user._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.firstName?.charAt(0) ||
                            user.name?.charAt(0) ||
                            "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.name || "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          Joined:{" "}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role || "user"}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.isActive ? "Verified" : "Unverified"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found</p>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
