import axios from "axios";
import "../scss/SearchResult.scss";
import { useAuth } from "../AuthProvider";
import { toast } from "react-toastify";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Post from "./Post";
import ReactPaginate from "react-paginate";
import Select from "react-select";
import { TailSpin } from "react-loader-spinner";

function SearchResult() {
  const [searchResult, setSearchResult] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    q: decodeURIComponent(searchParams.get("q")),
    sorted: searchParams.get("sorted") || "relevance",
    pageSize: searchParams.get("pageSize") || "5",
    page: searchParams.get("page") || "1",
  });
  const [pageOffset, setPageOffset] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
  const navigate = useNavigate();

  const fetchSearchResults = useCallback(async () => {
    if (filters.q === "null" || filters.q === "undefined" || filters.q === "") {
      return;
    }

    setIsLoading(true);
    const url = `${SERVER_DOMAIN}/search?q=${filters.q}${
      filters.page && `&page=${filters.page}`
    }${filters.sorted ? `&sorted=${filters.sorted}` : ""}${
      filters.pageSize && `&limit=${filters.pageSize}`
    }`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSearchResult(response.data.data);
      setTotalPages(response.data.totalPages);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("Error while searching. Please try again.");
      setIsLoading(false);
    }
  }, [filters, SERVER_DOMAIN, token]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  useEffect(() => {
    setFilters({
      q: decodeURIComponent(searchParams.get("q")),
      sorted: searchParams.get("sorted") || "relevance",
      pageSize: searchParams.get("pageSize") || "10",
      page: searchParams.get("page") || "1",
    });
  }, [searchParams]);

  const handleFilterChange = (filter, value) => {
    const newFilter = { ...filters, [filter]: value };
    if (filter === "pageSize") {
      newFilter.page = "1";
    }
    setFilters(newFilter);
    const newSearchParams = new URLSearchParams(newFilter);
    setSearchParams(newSearchParams);
    navigate(`/home/search?${newSearchParams.toString()}`);
  };

  const handlePageChange = (event) => {
    setPageOffset(event.selected + 1);
    handleFilterChange("page", event.selected + 1);
  };

  const options = [
    { value: 5, label: 5 },
    { value: 20, label: 20 },
    { value: 25, label: 25 },
    { value: 30, label: 30 },
    { value: 50, label: 50 },
  ];

  return (
    <div className="search-result">
      <div className="search-result__header">
        <h2>Search Result</h2>
        <div className="search-option">
          <p
            className={`search-option__item ${
              filters.sorted === "relevance" && "active"
            }`}
            onClick={() => {
              handleFilterChange("sorted", "relevance");
            }}
          >
            Relevance
          </p>
          <p
            className={`search-option__item ${
              filters.sorted === "newest" && "active"
            }`}
            onClick={() => {
              handleFilterChange("sorted", "newest");
            }}
          >
            Newest
          </p>
        </div>
      </div>
      <div className="search-result__body">
        <div className="result-list">
          {!isLoading &&
            searchResult.map((result) => (
              <Post post={result} key={result.post_id} />
            ))}
          {!isLoading && searchResult.length === 0 && <h2>No result found!</h2>}
          {isLoading && (
            <TailSpin
              visible={true}
              height="80"
              width="80"
              color="#c9c9c9"
              ariaLabel="tail-spin-loading"
              radius="1"
              wrapperStyle={{ alignSelf: "center", justifyContent: "center" }}
              wrapperClass="loading"
            />
          )}
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
              forcePage={pageOffset - 1}
            />
          )}
        </div>
        <div className="result-perPage">
          <h4>Choose number of result per page</h4>
          <Select
            defaultValue={options[0]}
            onChange={(selectedOption) => {
              handleFilterChange("pageSize", selectedOption.value);
            }}
            options={options}
          />
        </div>
      </div>
    </div>
  );
}

export default SearchResult;