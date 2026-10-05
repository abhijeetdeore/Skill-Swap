// src/pages/ViewSwap.jsx  (NEW page — the "Send swap request / reviews" detail screen)
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../firebase/store/authStore";
import {
  getUserById, getReviewsForUser, sendSwapRequest, submitReview,
  hasCompletedSwapWith, chatIdFor,
} from "../firebase/firestore";

export default function ViewSwap() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();

  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [reviewStars, setReviewStars] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Viewing your own profile through this page doesn't make sense — bounce
  // to the real Profile page instead of showing "send yourself a request".
  useEffect(() => {
    if (profile && userId === profile.id) {
      navigate("/profile", { replace: true });
    }
  }, [profile, userId]);

  const load = async () => {
    if (!profile || userId === profile.id) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [u, r, eligible] = await Promise.all([
        getUserById(userId),
        getReviewsForUser(userId),
        hasCompletedSwapWith(profile.id, userId),
      ]);
      setUser(u);
      setReviews(r);
      setCanReview(eligible);
    } catch (err) {
      console.error("ViewSwap load failed:", err);
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId, profile]);

  const matchScore = (() => {
    if (!profile || !user) return 0;
    const myWants = (profile.learns || []).map((l) => l.skill.toLowerCase());
    const theirSkills = (user.teaches || []).map((t) => t.skill.toLowerCase());
    const overlap = myWants.filter((s) => theirSkills.includes(s)).length;
    return myWants.length ? Math.round((overlap / myWants.length) * 100) : 0;
  })();

  const handleSendRequest = async () => {
    try {
      await sendSwapRequest({
        fromUserId: profile.id,
        toUserId: user.id,
        teachSkill: profile.teaches?.[0]?.skill || "",
        learnSkill: user.teaches?.[0]?.skill || "",
      });
      alert("Swap request sent!");
    } catch (err) {
      alert("Failed: " + err.message);
    }
  };

  const handleSubmitReview = async () => {
    if (reviewStars === 0) {
      alert("Please select a star rating.");
      return;
    }
    setSubmittingReview(true);
    try {
      await submitReview({ toUserId: user.id, fromUserId: profile.id, rating: reviewStars, text: reviewText });
      setReviewText("");
      setReviewStars(0);
      load();
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;
  if (loadError) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-600 mb-2">Something went wrong loading this page:</p>
        <p className="text-sm text-gray-600 mb-4">{loadError}</p>
        <button onClick={() => navigate(-1)} className="text-red-600 underline">Go back</button>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-600 mb-2">We couldn't find that user.</p>
        <button onClick={() => navigate(-1)} className="text-red-600 underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#FEFCE8] min-h-screen">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-[#E8DCC0] rounded-xl p-6">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div className="w-14 h-14 rounded-full bg-blue-300 flex items-center justify-center font-bold text-white">
                {user.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-gray-600">{user.location} · ★ {(user.rating || 0).toFixed(1)} rating · {user.swapsCompleted || 0} swaps completed</p>
              </div>
            </div>
            <span className="bg-green-700 text-white px-3 py-1 rounded-full text-sm">{matchScore}% match</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <div className="text-xs font-bold text-gray-600">OFFERS YOU</div>
              {(user.teaches || []).map((t) => (
                <span key={t.skill} className="inline-block bg-black text-white px-3 py-1 rounded-full text-sm mt-1 mr-1">{t.skill} · {t.level}</span>
              ))}
            </div>
            <div>
              <div className="text-xs font-bold text-gray-600">WANTS TO LEARN</div>
              {(user.learns || []).map((l) => (
                <span key={l.skill} className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm mt-1 mr-1">{l.skill} · {l.level}</span>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="font-bold">About</div>
            <p className="text-sm">{user.bio || "No bio provided."}</p>
          </div>

          <div className="mt-6">
            <div className="font-bold mb-2">Available</div>
            <div className="flex gap-1">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d} className={`px-2 py-1 rounded-full text-xs ${user.availability?.includes(d) ? "bg-black text-white" : "bg-white"}`}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button onClick={handleSendRequest} className="w-full bg-red-600 text-white py-3 rounded-full">Send swap request</button>
          <button onClick={() => navigate(`/chat/${chatIdFor(profile.id, user.id)}`)} className="w-full border border-red-400 text-red-600 py-3 rounded-full">Message</button>

          <div className="bg-[#E8DCC0] rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between"><span>Match score</span><span className="text-green-700 font-bold">{matchScore}%</span></div>
            <div className="flex justify-between"><span>Rating</span><span>{(user.rating || 0).toFixed(1)} / 5</span></div>
            <div className="flex justify-between"><span>Swaps completed</span><span>{user.swapsCompleted || 0}</span></div>
          </div>

          <div className="bg-[#E8DCC0] rounded-xl p-4">
            <div className="font-bold mb-2">Recent reviews</div>
            {reviews.slice(0, 3).map((r) => (
              <div key={r.id} className="mb-2 text-sm">
                <div className="font-semibold">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                <p>{r.text}</p>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-gray-500">No reviews yet.</p>}
          </div>
        </div>
      </div>

      <div className="mt-8 max-w-2xl">
        <h3 className="font-bold text-lg mb-2">Leave a review</h3>
        {canReview ? (
          <>
            <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Type your review over here.." className="w-full border rounded-xl px-4 py-3 mb-2" />
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setReviewStars(n)} className="text-2xl">
                  {n <= reviewStars ? "★" : "☆"}
                </button>
              ))}
            </div>
            <button disabled={submittingReview} onClick={handleSubmitReview} className="bg-red-600 text-white px-6 py-3 rounded-full">
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </>
        ) : (
          <p className="text-gray-500 text-sm">You can leave a review once you've completed a swap with {user.name}.</p>
        )}
      </div>
    </div>
  );
}
