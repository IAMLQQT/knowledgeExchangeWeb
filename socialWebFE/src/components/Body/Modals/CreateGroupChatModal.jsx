/* eslint-disable react/prop-types */
import { Code } from "react-content-loader";
import "../../../scss/Contacts.scss";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import "../../../scss/CreateGroupChatModal.scss"
import { useState } from "react";
function CreateGroupChatModal({ contacts, socket }) {
    const [newGroupMembers, setNewGroupMembers] = useState([]);
    const [groupName, setGroupName] = useState("");
    console.log(socket);

    // Hàm xử lý thêm/xóa user_id vào state
    const handleAddMember = (user_id) => {
        setNewGroupMembers((prev) =>
            prev.includes(user_id)
                ? prev.filter((id) => id !== user_id) // Nếu đã có, xóa khỏi mảng
                : [...prev, user_id] // Nếu chưa có, thêm vào mảng
        );
    };
    const handleSubmit = () => {
        if (!groupName || newGroupMembers.length < 2) {
            alert("Please provide a group name and select at least two member.");
            return;
        }

        socket.emit("createGroup", {
            group_name: groupName,
            member_ids: newGroupMembers,
        });
        
        alert(`Group "${groupName}" created successfully!`);
        setGroupName(""); // Reset lại tên nhóm
        setNewGroupMembers([]); // Reset lại danh sách thành viên
    };
    if (!contacts) return <Code />;
    console.log(contacts.map(contact => contact.user_id));
    return (
        <div className="">
            <h3>Add Group Chat</h3>
            <label htmlFor="group-name">Group Name</label>
            <input
                id="group-name"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)} // Lưu giá trị tên nhóm
            />
            <div className="user-contact">
                {contacts?.map((contact, index) => (
                    <ContactItem
                        contact={contact?.includedUser}
                        key={contact?.user_id}
                        handleAddMember={handleAddMember}
                    />
                ))}
            </div>
            <button className="btns" onClick={handleSubmit}>Submit</button>
        </div>
    );
}

// eslint-disable-next-line react/prop-types
function ContactItem({ contact, key, handleAddMember }) {
    return (
        <div
            className="contact-item flex a-center"
            key={key}
        >
            <img
                crossOrigin="anonymus"
                src={contact?.profile_picture}
                alt="contact-ava"
                key={key}
            />
            <p key={key}>
                {contact?.first_name} {contact?.last_name}
            </p>
            <input type="checkbox" onChange={() => handleAddMember(contact.user_id)} />
        </div>
    );
}

ContactItem.propTypes = {
    contact: PropTypes.object.isRequired,
    handleAddMember: PropTypes.func.isRequired,
};
export default CreateGroupChatModal;
