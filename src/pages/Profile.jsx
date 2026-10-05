// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../firebase/store/authStore";
import { getUserSwapHistory, getMySwaps, getMySwapPosts, deleteSwapPost } from "../firebase/firestore";

export default function Profile() {
  const { profile, deleteAccount } = useAuthStore();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeTrades, setActiveTrades] = useState(0);
  const [myPosts, setMyPosts] = useState([]);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const loadPosts = () => {
    if (profile) getMySwapPosts(profile.id).then(setMyPosts);
  };

  useEffect(() => {
    if (profile) {
      getUserSwapHistory(profile.id).then((h) => {
        setHistory(h);
        setLoadingHistory(false);
      });
      // "Active Trades" was reading a field that never got written anywhere —
      // compute it live from actual accepted swap requests instead.
      getMySwaps(profile.id).then((d) => setActiveTrades(d.active.length));
      loadPosts();
    }
  }, [profile]);

  const handleDeletePost = async (postId) => {
    if (!confirm("Delete this swap post? It will also disappear from Browse and Top Matches.")) return;
    await deleteSwapPost(postId, profile.id);
    loadPosts();
  };

  const handleDeleteAccount = async () => {
    if (!confirm("This permanently deletes your account and profile. This can't be undone. Continue?")) return;
    setDeletingAccount(true);
    try {
      await deleteAccount();
      navigate("/");
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        alert("For security, please log out and log back in, then try deleting your account again.");
      } else {
        alert("Failed to delete account: " + err.message);
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  if (!profile) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-8 bg-[#FEFCE8] min-h-screen">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Skill Swap</h1>
        <Link to="/profile/edit" className="bg-red-600 text-white px-5 py-2 rounded-full">Edit Profile</Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <img
          src={profile.photoURL || "https://api.dicebear.com/7.x/initials/svg?seed=" + profile.name}
          className="w-20 h-20 rounded-full"
          alt="avatar"
        />
        <div>
          <h2 className="text-xl font-bold">{profile.name}</h2>
          <p className="text-gray-500">{profile.location || "Location not set"}</p>
        </div>
      </div>

      <p className="mb-6">{profile.bio || "No bio yet — add one in Edit Profile."}</p>

      <div className="grid grid-cols-3 bg-[#E8DCC0] rounded-xl p-6 text-center mb-8">
        <div><div className="text-2xl font-bold text-blue-600">{profile.swapsCompleted || 0}</div>Swaps done</div>
        <div><div className="text-2xl font-bold text-blue-600">{(profile.rating || 0).toFixed(1)}</div>Rating</div>
        <div><div className="text-2xl font-bold text-blue-600">{activeTrades}</div>Active Trades</div>
      </div>

      <h3 className="font-bold text-lg mb-2">Teaches</h3>
      <div className="flex gap-2 flex-wrap mb-6">
        {(profile.teaches || []).map((t) => (
          <span key={t.skill} className="bg-[#E8DCC0] px-4 py-2 rounded-full">{t.skill}</span>
        ))}
        {(!profile.teaches || profile.teaches.length === 0) && <p className="text-gray-500">Nothing added yet.</p>}
      </div>

      <h3 className="font-bold text-lg mb-2">Wants to learn</h3>
      <div className="flex gap-2 flex-wrap mb-6">
        {(profile.learns || []).map((l) => (
          <span key={l.skill} className="bg-[#E8DCC0] px-4 py-2 rounded-full">{l.skill}</span>
        ))}
        {(!profile.learns || profile.learns.length === 0) && <p className="text-gray-500">Nothing added yet.</p>}
      </div>

      <h3 className="font-bold text-lg mb-2">My posted swaps</h3>
      <div className="space-y-2 mb-6">
        {myPosts.length === 0 && <p className="text-gray-500">You haven't posted any swaps yet.</p>}
        {myPosts.map((p) => (
          <div key={p.id} className="bg-[#E8DCC0] rounded-xl px-5 py-3 flex justify-between items-center">
            <div>
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm text-gray-600">{p.teachSkill} ⇆ {p.learnSkill}</div>
            </div>
            <button onClick={() => handleDeletePost(p.id)} className="text-red-600 text-sm font-semibold underline">
              Delete
            </button>
          </div>
        ))}
      </div>

      <h3 className="font-bold text-lg mb-2">Swap history</h3>
      <div className="space-y-2 mb-10">
        {loadingHistory ? (
          <p className="text-gray-500">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-500">No swaps yet.</p>
        ) : (
          history.map((h) => (
            <div key={h.id} className="border rounded-full px-5 py-3 flex justify-between items-center">
              <span>{h.teachSkill} for {h.learnSkill} with {h.otherUser?.name || "someone"}.</span>
              <span className={h.status === "completed" ? "text-red-600 font-semibold" : "text-green-700 font-semibold"}>
                {h.status === "completed" ? "Complete" : "In progress"}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="font-bold text-lg mb-2 text-red-700">Danger zone</h3>
        <p className="text-sm text-gray-600 mb-3">Deleting your account removes your profile permanently. This can't be undone.</p>
        <button
          onClick={handleDeleteAccount}
          disabled={deletingAccount}
          className="border border-red-600 text-red-600 px-5 py-2 rounded-full"
        >
          {deletingAccount ? "Deleting..." : "Delete account"}
        </button>
      </div>
    </div>
  );
}
