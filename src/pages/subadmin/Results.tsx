import { useEffect, useState } from "react";
import { Trophy, Search } from "lucide-react";
import axios from "axios";

export default function Results() {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const token = localStorage.getItem("access_token") || localStorage.getItem("token");

  // ✅ FETCH API DATA
  useEffect(() => {
    axios
      .get("https://lauratek.in:8000/student/admin/quiz-results", {

        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  // ✅ FILTER LOGIC
  const filteredData = data
    .filter((item) => {
      const matchesSearch =
        item.student_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.quiz_name?.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || item.quiz_name === filter;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => b.score - a.score); // 🔥 DESCENDING ORDER

  // ✅ UNIQUE QUIZ LIST FOR FILTER
  const quizList = ["All", ...new Set(data.map((i) => i.quiz_name))];

  // ✅ PAGINATION LOGIC
  const rowsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Results & Analytics
          </h1>
          <p className="text-sm text-gray-500">
            Track performance and view leaderboards
          </p>
        </div>
      </div>

      {/* ✅ SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">

        {/* SEARCH */}
        <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow w-full md:w-1/2">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search student or quiz..."
            className="w-full outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* FILTER */}
        <select
          className="bg-white px-3 py-2 rounded-lg shadow text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {quizList.map((quiz, index) => (
            <option key={index}>{quiz}</option>
          ))}
        </select>
      </div>

      {/* ✅ TOP PERFORMERS */}
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="text-yellow-500" size={20} />
          <div>
            <h2 className="font-semibold text-gray-800">
              Top Performers
            </h2>
            <p className="text-xs text-gray-500">
              Students based on quiz results
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {paginatedData.length > 0 ? (
            paginatedData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
              >
                {/* LEFT */}
                <div className="flex items-center gap-4">

                  {/* RANK */}
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-indigo-600 text-sm font-semibold border border-gray-200 shadow-sm">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </div>

                  {/* INITIAL */}
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500 text-white font-semibold">
                    {item.student_name?.charAt(0).toUpperCase()}
                  </div>

                  {/* DETAILS */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      {item.student_name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {item.quiz_name}
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="text-right">
                  <h3 className="text-lg font-semibold text-indigo-600">
                    {item.score}%
                  </h3>
                  <p className="text-xs text-gray-400">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-6">
              No results found
            </p>
          )}
        </div>
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow mt-4">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-800">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-semibold text-gray-800">{Math.min(currentPage * rowsPerPage, filteredData.length)}</span> of <span className="font-semibold text-gray-800">{filteredData.length}</span> results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
