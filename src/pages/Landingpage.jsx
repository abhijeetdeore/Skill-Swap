// src/pages/Landingpage.jsx
import { Link } from "react-router-dom";
import footerMap from "../assets/footer-map.png";

export default function Landingpage() {
  return (
    <div className="bg-[#FEFCE8] min-h-screen">
      <nav className="flex justify-between items-center px-8 py-6 border-b">
        <span className="font-bold text-xl">Logo</span>
        <div className="flex gap-6 items-center">
          <a href="#how">How It Works</a>
          <Link to="/browse">Browse Skills</Link>
          <Link to="/login" className="border border-blue-300 rounded-full px-5 py-2">Login</Link>
          <Link to="/register" className="bg-red-600 text-white rounded-full px-5 py-2">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-5xl font-bold mb-4 leading-tight">Trade skills, learn something new</h1>
          <p className="text-gray-600 mb-6">
            You have something to teach. Something else has what you want to learn,
            SkillSwap Exchange brings you together.
          </p>
          <div className="flex gap-4">
            <Link to="/register" className="bg-red-600 text-white px-6 py-3 rounded-full">Get Started →</Link>
            <Link to="/browse" className="border border-blue-300 px-6 py-3 rounded-full">Browse Skills</Link>
          </div>
        </div>
        <div className="bg-[#E8DCC0] rounded-2xl h-72 flex items-center justify-center font-semibold">
          Scrolling Skill wall
        </div>
      </section>

      {/* What makes it work */}
      <section id="how" className="px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-2">What makes it work</h2>
        <p className="text-gray-500 text-center mb-10">Tell us what you know and what you want to learn</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div className="bg-[#FDF6E3] border rounded-2xl p-6 row-span-2">
            <div className="w-20 h-20 bg-[#E8DCC0] rounded-xl mb-4 flex items-center justify-center">🖼️</div>
            <div className="text-sm text-gray-500 mb-1">01</div>
            <h3 className="text-xl font-bold text-blue-600 mb-2">Build your profile</h3>
            <p className="text-gray-600 mb-2">
              Add your skills and what you want to learn. The more specific you are, the better your matches will be.
            </p>
            <Link to="/register" className="text-red-600 font-semibold">Get started →</Link>
          </div>

          <div className="bg-[#E8DCC0] rounded-2xl p-6">
            <div className="text-sm mb-1">02</div>
            <h3 className="text-xl font-bold text-blue-600 mb-2">Find your match</h3>
            <p className="text-gray-700 mb-2">Browse people who want what you have to offer and offer what you want.</p>
            <Link to="/browse" className="text-red-600 font-semibold">Explore →</Link>
          </div>

          <div className="bg-[#E8DCC0] rounded-2xl p-6">
            <div className="text-sm mb-1">03</div>
            <h3 className="text-xl font-bold text-blue-600 mb-2">Connect and Exchange</h3>
            <p className="text-gray-700 mb-2">Message your match and start learning together.</p>
            <Link to="/register" className="text-red-600 font-semibold">Start →</Link>
          </div>
        </div>
      </section>

      {/* What makes us different */}
      <section className="px-8 py-16">
        <p className="text-center text-sm text-gray-500 mb-1">capabilities</p>
        <h2 className="text-3xl font-bold text-center mb-2">What makes us different</h2>
        <p className="text-gray-500 text-center mb-10">Connect with learners who match your interests</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <div className="bg-[#E8DCC0] rounded-2xl p-5">
            <div className="h-28 bg-[#D9C9A3] rounded-xl mb-3" />
            <div className="text-xs font-semibold mb-1">Discover</div>
            <h3 className="font-bold mb-1">Direct messaging</h3>
            <p className="text-sm text-gray-700 mb-2">Talk in real time with your skill exchange partner.</p>
            <span className="text-red-600 text-sm font-semibold">Message →</span>
          </div>

          <div className="bg-[#E8DCC0] rounded-2xl p-5">
            <div className="h-28 bg-[#D9C9A3] rounded-xl mb-3" />
            <div className="text-xs font-semibold mb-1">Learning together</div>
            <h3 className="font-bold mb-1">Build skills faster with someone who</h3>
            <p className="text-sm text-gray-700 mb-2">Track progress and celebrate wins together.</p>
            <span className="text-red-600 text-sm font-semibold">Explore →</span>
          </div>

          <div className="bg-[#E8DCC0] rounded-2xl p-5 row-span-1">
            <div className="h-28 bg-[#D9C9A3] rounded-xl mb-3" />
            <div className="text-xs font-semibold mb-1">View</div>
            <h3 className="font-bold mb-1">Grow at your own pace with real people</h3>
            <p className="text-sm text-gray-700 mb-2">Both of you move forward when you both try.</p>
            <span className="text-red-600 text-sm font-semibold">Start →</span>
          </div>
        </div>
      </section>

      {/* Get in touch */}
      <section className="px-8 py-16">
        <p className="text-sm text-gray-500 mb-1">Reach</p>
        <h2 className="text-3xl font-bold text-blue-600 mb-2">Get in touch</h2>
        <p className="text-gray-600 mb-10">Have questions or feedback? We're here to help you succeed.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-blue-600">Email</h3>
              <p>skillswapexchange.help@gmail.com</p>
            </div>
            <div>
              <h3 className="font-bold text-blue-600">Phone</h3>
              <p>+91 xxx-xxxxxxxx</p>
            </div>
            <div>
              <h3 className="font-bold text-blue-600">Office</h3>
              <p>00042, x street, y building, San Francisco</p>
            </div>
          </div>
          <img src={footerMap} alt="Office location map" className="w-full h-64 object-cover rounded-2xl" />
        </div>
      </section>

      <footer className="px-8 py-10 border-t text-center text-gray-500">
        <span className="font-bold">Logo</span>
        <div className="mt-2 flex justify-center gap-6">
          <a href="#how">How it works</a>
          <Link to="/browse">Browse Skills</Link>
        </div>
      </footer>
    </div>
  );
}
