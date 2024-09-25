import { useEffect, useState } from "react";
import "../scss/Users.scss";
import User from "../ui/User";
import axios from "axios";
import { toast } from "react-toastify";
import { TailSpin } from "react-loader-spinner";
import { useAuth } from "../AuthProvider";
import Select from "react-select";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";
function Users() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]); // [true, function
  const [isLoading, setIsLoading] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageOffset, setPageOffset] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
  const { token } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (search.trim() === "") {
      setIsNotFound(false);
      setSearchResult([]);
      return;
    }
    const handleSearch = () => {
      setIsLoading(true);

      axios
        .get(
          `${SERVER_DOMAIN}/user/search?name=${search}&limit=${pageSize}&page=${pageOffset}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          setIsNotFound(false);
          setIsLoading(false);
          setSearchResult(res.data.data); // [true, function]
          setTotalPages(res.data.totalPages);
        })
        .catch((err) => {
          if (err?.response?.status === 404) {
            setIsLoading(false);
            setIsNotFound(true);
          } else {
            toast.error("Error while searching. Please try again.");
          }
        });
    };
    const timer = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, pageSize, pageOffset]);

  const options = [
    { value: 3, label: 3 },
    { value: 20, label: 20 },
    { value: 25, label: 25 },
    { value: 30, label: 30 },
    { value: 50, label: 50 },
  ];
  const handlePageChange = (event) => {
    console.log(event);
    // TODO Only change displayed selected page
    // when its content is loaded in useEffect.
    setPageOffset(event.selected + 1);
  };
  if (!token) {
    navigate("/login");
  }
  return (
    <div className="user-search">
      <h1>Users</h1>
      <div className="flex j-between">
        <input
          type="text"
          placeholder="Filter by user"
          onChange={(e) => setSearch(e.target.value)}
        />
        <div>
          Choose number of users per page:
          <Select
            defaultValue={options[0]}
            onChange={(selectedOption) => {
              setPageSize(selectedOption.value);
              setPageOffset(1);
            }}
            options={options}
          />
        </div>
      </div>

      <div className="user-ctn">
        {isLoading && <TailSpin color="#333" height={80} width={80} />}
        {isNotFound && <p>No user found</p>}
        {!isLoading &&
          !isNotFound &&
          searchResult.map((user) => (
            <>
              <User key={user.user_id} user={user} />
            </>
          ))}
        {totalPages > 1 && (
          <ReactPaginate
            previousLabel="Previous"
            nextLabel="Next"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            breakLabel="..."
            breakClassName="page-item"
            breakLinkClassName="page-link"
            pageCount={totalPages}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageChange}
            containerClassName="pagination"
            activeClassName="active"
            forcePage={pageOffset}
          />
        )}
      </div>
    </div>
  );
}

export default Users;