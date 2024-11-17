import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login/LoginUI/Login";
import ForgetPassword from "./components/Login/Password/ForgetPassword";
import ResetPassword from "./components/Login/Password/ResetPassword";
import HomePage from "./components/Body/HomePage/HomePage";
import "./reset.css";
import PostDetail from "./components/Body/Post/PostDetail";
import Profile from "./components/Body/Profile/Profile";
import ProfileDetail from "./components/Body/Profile/ProfileDetail";
import Message from "./components/Body/Message/Message";
import SetInitialPassword from "./components/Login/Password/SetInitialPassword";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./AuthProvider";
import ChangePassword from "./components/Login/Password/ChangePassword";
import { UserProvider } from "./UserProvider";
import SavedPost from "./components/Body/Post/SavedPost";
import Users from "./components/Body/Search/Users";
import SearchResult from "./components/Body/Search/SearchResult"
import VerificationPage from "./components/Login/Verification/VerificationPage";
import AdminLogin from "./components/Admin/AdminLogin"
import AdminHomePage from "./components/Admin/AdminPage/AdminHomePage";
import UserManagement from "./components/Admin/AdminPage/Body/UserManagement";
import PostManagement from "./components/Admin/AdminPage/Body/PostManagement";
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <Routes>
            <Route path="" element={<HomePage />}>
              <Route path="profile/:userId?" element={<Profile />} />
              <Route path="profiledetail" element={<ProfileDetail />} />
              <Route path="post/:postId" element={<PostDetail />} />
              <Route path="savedposts" element={<SavedPost />} />
              <Route path="users" element={<Users />} />
              <Route path="search" element={<SearchResult />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/messages" element={<Message />} />
            <Route path="/forgetpassword" element={<ForgetPassword />} />
            <Route path="/resetpassword/:token" element={<ResetPassword />} />
            <Route path="/setpassword" element={<SetInitialPassword />} />
            <Route path="/changepassword" element={<ChangePassword />} />
            <Route path="/verifyaccount/:token" element={<VerificationPage />} />
            <Route path="/admin" element={<AdminHomePage />}>
              <Route path="usermanagement" element={<UserManagement />} />
              <Route path="postmanagement" element={<PostManagement />}/>
              <Route path="postmanagement/post/:postId" element={<PostDetail />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="*" element={<h1> Page not found, 404! </h1>} />
          </Routes>
        </UserProvider>
      </AuthProvider>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
