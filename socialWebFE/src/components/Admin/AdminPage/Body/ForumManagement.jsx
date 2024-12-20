import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from "../../../../AuthProvider";
import "../../../../scss/UserManagement.scss"
import { Code } from "react-content-loader";
import InfiniteScroll from "react-infinite-scroll-component";
import CreateForumModal from '../Modals/CreateForumModal';
import Post from "../../../Body/Post/Post";
import { useUser } from "../../../../UserProvider";
import Forum from '../../../Body/Forum/ForumList';
const ForumManagement = () => {
    const [forums, setForums] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [refresher, setRefresher] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [modalIsOpen, setIsOpen] = useState(false);
    const { user, handleGetProfile } = useUser();
    const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
    const page = useRef(1);
    const { token } = useAuth();

    const fetchForums = () => {
        page.current += 1;
        axios
            .get(`${SERVER_DOMAIN}/getAllForums`, {
                params: {
                    forum_status: activeTab,
                    limit: 5,
                    page: page.current
                },
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
                setForums([...forums, ...res.data.data]);
            })
            .catch((err) => {
                console.log(err);
                setHasMore(false);
            });
    };

    useEffect(() => {
        axios
            .get(`${SERVER_DOMAIN}/getAllForums`, {
                params: {
                    forum_status: activeTab,
                    limit: 5,
                    page: page.current
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                console.log("data", res.data.data);
                setIsLoading(false);
                setForums(res.data.data);
            })
            .catch((err) => {
                console.error("Error fetching forum:", err);
                setIsLoading(false);
            });
    }, [refresher, activeTab]);


    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredForums = forums.filter((forum) =>
        (`${forum.forum_name} `).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleTabClick = (status) => {
        setActiveTab(status);
        setForums([]); // Reset danh sách bài viết
        setHasMore(true); // Cho phép tải thêm bài viết
        page.current = 1; // Reset trang về 1
        setRefresher(!refresher); // Trigger reload
    };
    return (
        <div className="main-page">
            <div className="management">
                <h2>Forum Management</h2>
                <div className="header_child flex a-center">
                    <button className="arrange">
                        <i className="fa-solid fa-arrow-up-z-a"></i>
                    </button>
                    <h3>Forum list</h3>
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
                            className={activeTab === 0 ? 'active-tab' : ''}
                            onClick={() => handleTabClick(0)}
                        >
                            Active Forum
                        </li>
                        <li
                            className={activeTab === 1 ? 'active-tab' : ''}
                            onClick={() => handleTabClick(1)}
                        >
                            Hidden Forum
                        </li>
                    </ul>
                </nav>
                <div className="post-management">
                    {!isLoading ? (
                        <InfiniteScroll
                            dataLength={forums?.length}
                            next={fetchForums}
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
                            {filteredForums?.map((forum) => (
                                <Forum forum={forum} key={forum.forum_id} setRefresher={setRefresher} />
                            ))}

                        </InfiniteScroll>
                    ) : (
                        <>
                            <Code className="forum" />
                            <Code className="forum" />
                        </>
                    )}
                </div>
                <button onClick={() => setIsOpen(true)} className='btn-add-forum'>
                    Add Forum
                </button>
                <CreateForumModal
                    modalIsOpen={modalIsOpen}
                    setIsOpen={setIsOpen}
                    setRefresher={setRefresher}
                    user={user?.user}
                />
            </div>
        </div>
    );
};

export default ForumManagement;
