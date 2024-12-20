import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from "../../../../AuthProvider";
import "../../../../scss/UserManagement.scss"
import { Code } from "react-content-loader";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "../../../Body/Post/Post";
const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [refresher, setRefresher] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [activeTab, setActiveTab] = useState("0");
    const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
    const page = useRef(1);
    const { token } = useAuth();

    const fetchPosts = () => {
        page.current += 1;
        axios
            .get(`${SERVER_DOMAIN}/admin/getPostsManagement?post_status=${activeTab}&page=${page.current}&limit=5`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                if (res.data.data.length < 4) {
                    setHasMore(false);
                    return;
                }
                console.log("fetch", res.data.data);
                setPosts([...posts, ...res.data.data]);
            })
            .catch((err) => {
                console.log(err);
                setHasMore(false);
            });
    };

    useEffect(() => {
        axios
            .get(`${SERVER_DOMAIN}/admin/getPostsManagement?post_status=${activeTab}&page=${page.current}&limit=5`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                console.log("data", res.data.data);
                setIsLoading(false);
                setPosts(res.data.data);
            })
            .catch((err) => {
                console.error("Error fetching posts:", err);
                setIsLoading(false);
            });
    }, [refresher, activeTab]);


    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredPost = posts.filter((post) =>
        (`${post.title} `).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const handleTabClick = (status) => {
        setActiveTab(status);
        setPosts([]); // Reset danh sách bài viết
        setHasMore(true); // Cho phép tải thêm bài viết
        page.current = 1; // Reset trang về 1
        setRefresher(!refresher); // Trigger reload
    };
    return (
        <div className="main-page">
            <div className="management">
                <h2>Post Management</h2>
                <div className="header_child flex a-center">
                    <button className="arrange">
                        <i className="fa-solid fa-arrow-up-z-a"></i>
                    </button>
                    <h3>Post list</h3>
                    <form className="search search-user">
                        <div className="input-group">
                            <label htmlFor="search-user">
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </label>
                            <input
                                id="search-user"
                                type="text"
                                placeholder="Search for post"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </form>
                    <div className="line"></div>
                </div>
                <nav>
                    <ul className='flex '>
                        <li
                            className={activeTab === "0" ? 'active-tab' : ''}
                            onClick={() => handleTabClick("0")}
                        >
                            Active Post
                        </li>
                        <li
                            className={activeTab === "1" ? 'active-tab' : ''}
                            onClick={() => handleTabClick("1")}
                        >
                            Hidden Post
                        </li>
                    </ul>
                </nav>
                <div className="post-management">
                    {!isLoading ? (
                        <InfiniteScroll
                            dataLength={posts?.length}
                            next={fetchPosts}
                            hasMore={hasMore}
                            loader={<Code className="post" />}
                            endMessage={
                                <p style={{ textAlign: "center", marginTop: "2rem" }}>
                                    <b>Yay! You have seen it all</b>
                                </p>
                            }
                            style={{
                                maxHeight: '70vh', // Giới hạn chiều cao của InfiniteScroll
                                overflowY: 'auto' // Cho phép cuộn dọc
                            }}
                        >
                            {filteredPost?.map((post) => (
                                <Post post={post} key={post.post_id} setRefresher={setRefresher} />
                            ))}

                        </InfiniteScroll>
                    ) : (
                        <>
                            <Code className="post" />
                            <Code className="post" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostManagement;
