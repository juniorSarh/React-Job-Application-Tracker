import { FaSignOutAlt } from "react-icons/fa";
import JobList from "../components/Jobslist";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  function handleLogout() {
    localStorage.removeItem("auth_user");
    nav("/login");
  }

  return (
    <div className="home">
      <header className="home__topbar">
        <div className="home__brand">Job App Tracker</div>

        {/* <nav className="home__nav">
          <a href="/home" className="home__navItem active">
            Home
          </a>
        </nav> */}

        <button
          onClick={handleLogout}
          className="home__logoutBtn"
          aria-label="Logout"
        >
          <FaSignOutAlt size={22} />
        </button>
      </header>

      <main className="home__content">
        <h1>Welcome to Job App Tracker</h1>
        <p>This is your dashboard.</p>

       
        <main className="home__content">
          <h1 className="home__h1">Jobs</h1>
          <JobList />
        </main>
      </main>

      <footer className="home__footer" />
    </div>
  );
}
