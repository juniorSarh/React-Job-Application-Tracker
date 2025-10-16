
import { FaUser } from "react-icons/fa6";

export default function NavBar() {
  return (
    <div>
      <header className="landing__topbar">
        <span className="landing__brand">Job App Tracker</span>

        <div className="landing__avatar" aria-label="Profile">
          <FaUser />
        </div>
      </header>
    </div>
  );
}
