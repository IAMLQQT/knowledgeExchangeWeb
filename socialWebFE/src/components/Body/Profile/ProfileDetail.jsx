import { Code } from "react-content-loader";
import { useUser } from "../../../UserProvider";
import "../../../scss/ProfileDetail.scss";

import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../AuthProvider";
import { toast } from "react-toastify";
export default function ProfileDetail() {
  const { user, handleGetProfile } = useUser();
  const { token } = useAuth();
  const profile = user?.user;
  const navigate = useNavigate();
  console.log("profile", profile);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickName, setNickName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
  const handleChooseFile = () => {
    fileInputRef.current.click();
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log(file);
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      fileReader.readAsDataURL(file);
    }
  };
  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("nick_name", nickName);
    formData.append("email", email);
    formData.append("bio", bio);
    if (selectedFile) {
      formData.append("profile_picture", selectedFile);
    }
    console.log("formData", formData);
    axios
      .post(`${SERVER_DOMAIN}/user/updateProfile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        handleGetProfile();
        navigate(`/profile/`);
        toast.success("Update profile successfully!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
        });
      })
      .catch(() => {
        toast.error("Something went wrong! Please try again!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
        });
      });
  };
  useEffect(() => {
    setFirstName(profile?.first_name);
    setLastName(profile?.last_name);
    setNickName(profile?.nick_name);
    setEmail(profile?.email);
    setBio(profile?.bio);
  }, [profile]);
  if (!profile) return <Code></Code>;

  return (
    <div className="user-information flex a-center ">
      <h2>Edit Profile</h2>
      <img
        crossOrigin="anonymous"
        src={previewUrl || profile.profile_picture}
        alt=""
      />
      <label
        form="avatar-user"
        className="lable-edit"
        onClick={handleChooseFile}
      >
        Edit Photo User
      </label>
      <input
        style={{ display: "none" }}
        type="file"
        name="avatar-playlist"
        id="avatar-user"
        accept="image/png, image/jpeg"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div className="information flex a-center j-between">
        <div className="item-group">
          <span>First Name</span>
          <input
            className="name-user"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            minLength={2}
          />
        </div>
        <div className="item-group ">
          <span>Email</span>
          <input
            className="email-user"
            type="email"
            value={profile.account.email}
            required
          />
        </div>
        <div className="item-group">
          <span>Last Name</span>
          <input
            className="name-user"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            minLength={2}
          />
        </div>
        <div className="item-group">
          <span>Nick Name</span>
          <input
            className="nickname-user"
            defaultValue={profile.nick_name}
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
          />
        </div>
        <div className="item-group">
          <span>bio</span>
          <textarea
            name=""
            id=""
            cols="30"
            rows="5"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          ></textarea>
        </div>
      </div>
      <div className="button flex">
        <div>
          <Link to="/changepassword" className="btns btn-edit-password">
            Change password
          </Link>
        </div>
        <div>
          <Link to="/" className="btns btn-back">
            Back
          </Link>
          <button className="btns btn-submit" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
