const AdminSidebar = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <nav className="bg-white rounded-lg shadow-sm p-4">
      <ul className="space-y-2">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <button
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-md transition-colors duration-200 flex items-center space-x-3 ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AdminSidebar;
