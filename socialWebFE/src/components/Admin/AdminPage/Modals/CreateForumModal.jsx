/* eslint-disable react/prop-types */
import Modal from "react-modal";
import "../../../../scss/CreatePostModal.scss";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css

import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../../AuthProvider";
import { toast } from "react-toastify";
import moment from "moment";
const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        width: "50%", // Adjust the width as needed
        height: "60%", // Adjust the height as needed
        border: "2px solid #ccc",
        boxShadow:
            " 0px 54px 55px rgba(0, 0, 0, 0.25), ) 0px -12px 30px rgba(0, 0, 0, 0.12, 0px 4px 6px rgba(0, 0, 0, 0.12) ,  0px 12px 13px rgba(0, 0, 0, 0.17),  0px -3px 5px rgba(0, 0, 0, 0.09)", // Add shadow to the border
    },
};
Modal.setAppElement("#root");
// eslint-disable-next-line react/prop-types
function CreateForumModal({ modalIsOpen, setIsOpen, user, setRefresher }) {
    const { token } = useAuth();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [beforeUnloadListenerAdded, setBeforeUnloadListenerAdded] =
        useState(false);
    const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
    useEffect(() => {
        const beforeUnloadHandler = (e) => {
            const confirmationMessage = "Are you sure you want to leave?";
            e.returnValue = confirmationMessage;
            return confirmationMessage;
        };

        // Add the event listener when the component mounts
        if (title || content) {
            if (!beforeUnloadListenerAdded) {
                window.addEventListener("beforeunload", beforeUnloadHandler);
                setBeforeUnloadListenerAdded(true);
            }
            setBeforeUnloadListenerAdded(false);
        }

        // Remove the event listener when the component unmounts
        return () => {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
        };
    }, [title, content]);

    function afterOpenModal() {
        // document.querySelector("body").style.overflowY = "hidden";
        // document.querySelector("body").style.margin = "0";
        // document.querySelector("body").style.height = "100%";
        // references are now sync'd and can be accessed.
        document.querySelector("body").style.overflow = "hidden";
        document.querySelector("body").style.paddingRight = "15px";
    }

    function closeModal() {
        if (title || content) {
            confirmAlert({
                title: "You didn't save your post.",
                message: "Are you sure to exit?",
                buttons: [
                    {
                        label: "Yes",
                        onClick: () => {
                            setIsOpen(false);

                            setTitle("");
                            setContent("");
                            document.querySelector("body").style.overflow = "unset";
                            document.querySelector("body").style.paddingRight = "0px";
                        },
                    },
                    {
                        label: "No",
                        onClick: () => { },
                    },
                ],
            });
        } else {
            setIsOpen(false);
            document.querySelector("body").style.overflow = "unset";
            document.querySelector("body").style.paddingRight = "0px";
        }
    }
    function handleSubmit(e) {
        e.preventDefault();
        if (title.length < 15 || content.length < 50) return;
        document.querySelector(".post-button").setAttribute("disabled", true);
        document.querySelector(".post-button").style.cursor = "not-allowed";
        axios
            .post(
                SERVER_DOMAIN + "/admin/addForum",
                {
                    user_id: user.id,
                    forum_name: title,
                    forum_description: content,
                    created_at: moment().unix(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then(() => {
                toast.success("Forum created successfully!", {
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: 5000,
                });
                setIsOpen(false);
                setTitle("");
                setContent("");
                document.querySelector("body").style.overflow = "unset";
                document.querySelector(".post-button").removeAttribute("disabled");
                document.querySelector(".post-button").style.cursor = "pointer";
                setRefresher((prev) => !prev);
            })
            .catch((err) => {
                console.log(err);
                toast.error("Something went wrong! Please try again!", {
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: 5000,
                });
            });
    }
    return (
        <div className="create-post-modal">
            <Modal
                isOpen={modalIsOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Create Forum Modal"
            >
                <h1>Create Forum</h1>
                <button onClick={closeModal}>
                    <img src="/close.png" alt="close button" />
                </button>
                <div className="user flex a-center">
                    <img
                        crossOrigin="anonymous"
                        className="avatar"
                        src={user?.profile_picture}
                        alt="user-ava"
                    />
                    <p>{user?.first_name}</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <h2>Title</h2>
                    <p>
                        Be specific and imagine you’re asking a question to another person.
                    </p>

                    <textarea
                        maxLength={150}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        name="title"
                    ></textarea>
                    {title.length < 15 && (
                        <p className="error">Title must be at least 15 characters.</p>
                    )}
                    {title.length >= 130 && title.length <= 150 && (
                        <p className="error">{`${150 - title.length} characters left`}</p>
                    )}
                    <h2>Description</h2>
                    <p>
                        The body of your question contains your problem details and results.
                        Minimum 50 characters.
                    </p>

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        name="content"
                    ></textarea>
                    {content.length < 50 && (
                        <p className="error">Minimum 50 characters.</p>
                    )}
                    <button type="submit" className="post-button">
                        Submit
                    </button>
                </form>
            </Modal>
        </div>
    );
}

export default CreateForumModal;
