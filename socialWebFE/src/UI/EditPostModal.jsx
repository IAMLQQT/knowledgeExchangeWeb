/* eslint-disable react/prop-types */
import Modal from "react-modal";
import "../scss/CreatePostModal.scss";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../AuthProvider";
import { toast } from "react-toastify";
import moment from "moment";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import PostDetail from "../pages/PostDetail";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "55%", // Adjust the width as needed
    height: "78%", // Adjust the height as needed
    border: "2px solid #ccc",
    padding: "2rem",
    boxShadow:
      " 0px 54px 55px rgba(0, 0, 0, 0.25), ) 0px -12px 30px rgba(0, 0, 0, 0.12, 0px 4px 6px rgba(0, 0, 0, 0.12) ,  0px 12px 13px rgba(0, 0, 0, 0.17),  0px -3px 5px rgba(0, 0, 0, 0.09)", // Add shadow to the border
  },
};

const modules = {
  toolbar: [
    [{ font: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

Modal.setAppElement("#root");

// eslint-disable-next-line react/prop-types
function EditPostModal({
  isModalOpen,
  setIsOpen,
  user,
  curTitle,
  curContent,
  curCode = "",
  curTags = [],
  postId,
  setRefresher,
}) {
  const { token } = useAuth();
  const [title, setTitle] = useState(curTitle);
  const [content, setContent] = useState(curContent);
  const [code, setCode] = useState(curCode);
  const [Tags, setTags] = useState(curTags);
  const [plainText, setPlainText] = useState("");
  const postButtonRef = useRef(null);
  const quillRef = useRef(null);

  const [beforeUnloadListenerAdded, setBeforeUnloadListenerAdded] =
    useState(false);
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;

  useEffect(() => {
    if (quillRef.current) {
      setPlainText(quillRef.current.getEditor().getText());
      console.log(quillRef.current.getEditor().getText().length);
      console.log(quillRef.current.getEditor().getText());
    }
  }, [content]);
  useEffect(() => {
    if (quillRef.current) {
      setPlainText(quillRef.current.getEditor().getText());
      console.log(quillRef.current.getEditor().getText().length);
      console.log(quillRef.current.getEditor().getText());
    }
  }, []);

  useEffect(() => {
    const beforeUnloadHandler = (e) => {
      const confirmationMessage = "Are you sure you want to leave?";
      e.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    // Add the event listener when the component mounts
    if (title || content || code) {
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
  }, [title, content, code]);

  function afterOpenModal() {
    document.querySelector("body").style.overflow = "hidden";
    document.querySelector("body").style.paddingRight = "15px";
  }

  function closeModal() {
    if (title || content || code) {
      confirmAlert({
        title: "You didn't save your post.",
        message: "Are you sure to exit?",
        buttons: [
          {
            label: "Yes",
            onClick: () => {
              setIsOpen(false);
              setCode(curCode);
              setContent(curContent);
              setTags(curTags);
              document.querySelector("body").style.overflow = "unset";
              document.querySelector("body").style.paddingRight = "0px";
            },
          },
          {
            label: "No",
            onClick: () => {},
          },
        ],
      });
    } else {
      setIsOpen(false);
      document.querySelector("body").style.overflow = "unset";
      document.querySelector("body").style.paddingRight = "0px";
    }
  }

  const handleTextareaChange = (e) => {
    const { name, value } = e.target;
    if (name === "content") {
      setContent(value);
      autoResizeTextarea(e.target);
    } else if (name === "code") {
      setCode(value);
      autoResizeTextarea(e.target);
    }
  };

  const autoResizeTextarea = (textarea) => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight + 25}px`;
  };

  function handleSubmit(e) {
    e.preventDefault();
    const plainTextContent = quillRef.current.getEditor().getText();
    if (plainTextContent.length < 220) return;


    axios
      .put(
        SERVER_DOMAIN + "/updatePost/" + postId,
        {
          title,
          content,
          code,
          Tags,
          updated_at: moment().unix(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        toast.success("Post was updated successfully!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
        });
        setIsOpen(false);
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
        isOpen={isModalOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Create Post Modal"
      >
        <h1>Edit Post</h1>
        <button onClick={closeModal}>
          <img src="/close.png" alt="close button" />
        </button>
        <div className="user flex a-center">
          <img
            crossOrigin="anonymous"
            className="avatar"
            src={user?.profile_picture}
            alt="user-ava"
            onError={(e) => {
              e.target.src = "/public/user.png";
            }}
          />
          <p>{user?.first_name}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <h2>Title</h2>
          <p>
            Be specific and imagine you’re asking a question to another person.
          </p>
          <textarea
            disabled
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            name="title"
          ></textarea>

          <h2>Content</h2>
          <p>
            The body of your question contains your problem details and results.
            Minimum 220 characters.
          </p>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            ref={quillRef}
            modules={modules}
          />
          {plainText.length < 220 && (
            <p className="error">Minimum 220 characters.</p>
          )}
          <h2>Code</h2>
          <p>
            Include all the things you have tried and all the code you are
            working with.
          </p>
          <textarea
            value={code}
            onChange={handleTextareaChange}
            name="code"
            placeholder="Write your code here. Not required."
          ></textarea>
          <h2>Tags</h2>
          <p>
            Add up to 5 tags to describe what your question is about. Tags are
            not required but highly recommended.
          </p>
          <textarea
            value={Tags}
            onChange={(e) => setTags(e.target.value)}
            name="Tags"
            placeholder="Separate tags with a comma. e.g., python,java,reactjs. If you don't, it won't show up on your post!"
          ></textarea>
          <button type="submit" className="post-button" ref={postButtonRef}>
            Update
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default EditPostModal;