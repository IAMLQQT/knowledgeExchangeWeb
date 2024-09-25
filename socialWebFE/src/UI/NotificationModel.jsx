// src/components/FriendRequestNotification.js
import React from 'react';
import '../scss/Notification.scss';
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthProvider";
import { useUser } from "../UserProvider";
import { Code } from "react-content-loader";
import InfiniteScroll from "react-infinite-scroll-component";

import axios from "axios";

export default function NotificationModel() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const { token } = useAuth();
    const { user } = useUser();
    const page = useRef(1);
    const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
    const [refresher, setRefresher] = useState(false);

    const handleNotificationClick = () => {
        setShowNotifications(!showNotifications);
    };
    const handleAcceptButton = (user_sent_id) => {
        axios
            .post(
                SERVER_DOMAIN + "/user/acceptFriendrequest",
                {
                    user_id: user.user_id,
                    user_sent_id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then((res) => {
                setRefresher(true);
                console.log("Friend request accepted:", res.data);
            })
            .catch((err) => {
                console.error("Error accepting friend request:", err);
            });
    };
    const handleDeclineButton = async (request_id) => {
        try {
            await axios.post(
                SERVER_DOMAIN + "/user/declidefriendrequest",
                {
                    request_id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setRefresher(true); // Đặt lại trạng thái refresh sau khi từ chối yêu cầu
        } catch (err) {
            console.error(err);
        }
    };
    const fetchNotifications = () => {
        page.current += 1;
        axios
            .get(SERVER_DOMAIN + `/user/getfriendrequest?page=${page.current}&limit=5`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                },
            })
            .then((res) => {
                if (res.data.data.length === 0) {
                    setHasMore(false);
                    return;
                }
                console.log("fetch", res.data.data);
                setNotifications([...notifications, ...res.data.data]);
            })
            .catch((err) => {
                console.log(err);
                setHasMore(false);
            });
    };
    useEffect(() => {
        axios
            .get(SERVER_DOMAIN + "/user/getfriendrequest?page=1&limit=5", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                console.log("data", res.data.data);
                setIsLoading(false);
                setNotifications(res.data.data);
                setRefresher(false);
            });
    }, [user, refresher]);
    return (
        <div className="wrapper">
            <button onClick={handleNotificationClick}>
                <i class="fas fa-bell"></i>
                <span>{notifications[0]?.count || 0}</span>
            </button>
            {showNotifications && (
                <div className="notification-dropdown">
                    {!isLoading ? (
                        notifications.length === 0 ? (
                            <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "16px" }}>
                                <b>No notifications</b>
                            </p>
                        ) : (
                            <InfiniteScroll
                                dataLength={notifications.length}
                                next={fetchNotifications}
                                hasMore={hasMore}
                                loader={<Code className="notification" />}
                                endMessage={
                                    <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "16px" }}>
                                        <b>Yay! There are no more notifications to load</b>
                                    </p>
                                }
                            >
                                {notifications.map((notification) => (
                                    <div className="friend-request-notification" key={notification.request_id}>
                                        <img src={notification.user_sent.profile_picture} alt={notification.user_sent.first_name} className="profile-picture" />
                                        <div className="notification-content">
                                            {notification.isAccepted ? (
                                                <p>You have accepted the friend request from {notification.user_sent.first_name}.</p>
                                            ) : (
                                                <p><strong>{notification.user_sent.first_name}</strong> has sent you a friend request.</p>
                                            )}
                                            <div className="notification-actions">
                                                {!notification.isAccepted && (
                                                    <>
                                                        <button className="accept-button" onClick={() => handleAcceptButton(notification?.user_sent?.user_id)}>Accept</button>
                                                        <button className="decline-button" onClick={() => handleDeclineButton(notification?.request_id)}>Decline</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </InfiniteScroll>
                        )
                    ) : (
                        <>
                            <Code className="notification" />
                            <Code className="notification" />
                        </>
                    )}

                </div>
            )}
        </div>

    );
};


