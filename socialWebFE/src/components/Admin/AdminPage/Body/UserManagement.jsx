import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../../AuthProvider";
import "../../../../scss/UserManagement.scss"

const UserManagement = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
    const { token } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${SERVER_DOMAIN}/admin/getAllUserAccounts`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setAllUsers(response.data.allUserAccounts);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, [SERVER_DOMAIN, token]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusChange = async (accountID, newStatus) => {
        try {
            const response = await axios.patch(
                `${SERVER_DOMAIN}/admin/updateUserStatus`,
                { accountID, newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(response.data.message);
            setAllUsers(allUsers.map(user => 
                user.accountID === accountID ? { ...user, account: { ...user.account, account_status: newStatus } } : user
            ));
        } catch (error) {
            console.log(accountID, newStatus);

            console.error("Error updating user status:", error);
            alert("Failed to update user status");
        }
    };
    const handleRoleChange = async (accountID, newRoleID) => {
        try {
            const response = await axios.patch(
                `${SERVER_DOMAIN}/admin/updateUserRole`,
                { accountID, newRoleID },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(response.data.message);
            setAllUsers(allUsers.map(user => 
                user.accountID === accountID ? { ...user, account: { ...user.account, RoleID: newRoleID } } : user
            ));
        } catch (error) {
            console.log(accountID, newRoleID);
            
            console.error("Error updating user role:", error);
            alert("Failed to update user role");
        }
    };
    const filteredUsers = allUsers.filter((user) =>
        (`${user.accountID} `).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="main-page">
            <div className="management">
                <h2>User Management</h2>
                <div className="header_child flex a-center">
                    <button className="arrange">
                        <i className="fa-solid fa-arrow-up-z-a"></i>
                    </button>
                    <h3>User list</h3>
                    <form className="search search-user">
                        <div className="input-group">
                            <label htmlFor="search-user">
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </label>
                            <input
                                id="search-user"
                                type="text"
                                placeholder="Search for user"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </form>
                    <div className="line"></div>
                </div>

                <div className="user-list">
                    <table className="table table-dark">
                        <thead>
                            <tr>
                                <th scope="col">Account ID</th>
                                <th scope="col">Image</th>
                                <th scope="col">Email</th>
                                <th scope="col">User Name</th>
                                <th scope="col">Account Status</th>
                                <th scope="col">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.user_id} className="user">
                                        <td className="account_id">{user.accountID}</td>
                                        <td className="image_user">
                                            <img crossOrigin="anonymous" src={user.profile_picture} alt="User" />
                                        </td>
                                        <td className="email">{user.account.email}</td>
                                        <td className="name_user">{user.first_name} {user.last_name}</td>
                                        <td>
                                            <select
                                                onChange={(e) => handleStatusChange(user.accountID, e.target.value)}
                                                value={user.account.account_status}
                                            >
                                                <option value="INACTIVE">INACTIVE</option>
                                                <option value="ACTIVE">ACTIVE</option>
                                                <option value="LOCKED">LOCKED</option>
                                                <option value="DELETED">DELETED</option>
                                                <option value="SUSPENDED">SUSPENDED</option>
                                            </select>
                                        </td>
                                        <td className="Role">
                                            <select
                                                value={user.account.RoleID}
                                                onChange={(e) => handleRoleChange(user.accountID, e.target.value)}
                                            >
                                               <option value="user">user</option>
                                               <option value="admin">admin</option>
                                            </select>
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7">No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
