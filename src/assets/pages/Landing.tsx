import { Link } from "react-router-dom";
import React from "react";
import hero from "../images/LandingImage.png"; // <— hero image
import NavBar from "../components/NavBar";


export default function Landing() {
  return (
    <div className="landing">
      {/* Top bar */}
      <NavBar />
      {/* Main content */}
      <main className="landing__main">
        <section className="landing__copy">
          <h1 className="landing__title">
            Welcome to Job Application Tracking System
          </h1>

          <div className="landing__about">
            <h2>More About Site</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
              eu auctor velit. Proin ut massa quis nibh lacinia accumsan. Nulla
              facilisi. In hac habitasse platea dictumst.
            </p>

            <div className="landing__actions">
              <Link className="btn btn--primary" to="/login">
                Login
              </Link>
              <Link className="btn btn--ghost" to="/signup">
                Signup
              </Link>
            </div>
          </div>
        </section>

        <section className="landing__art" aria-hidden="true">
          <img
            src={hero}
            alt="Person at a desk with devices"
            className="landing__image"
          />
        </section>
      </main>

      {/* Bottom bar (visual only) */}
      <footer className="landing__footer" />
    </div>
  );
}
