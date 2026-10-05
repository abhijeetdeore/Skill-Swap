// src/firebase/firestore.js
// Every page imports what it needs from here. Keeping all Firestore calls
// in one file means one schema, no duplicated query logic.

import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, setDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp,
  arrayUnion, increment, Timestamp, runTransaction, writeBatch,
} from "firebase/firestore";
import { db } from "./config";

/* ---------------- USERS ---------------- */

export async function getUserById(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, "users", uid), data);
}

// Simple match-score heuristic: how much of what I teach overlaps with what
// they want to learn, and vice versa. Swap this for something smarter later.
function computeMatchScore(me, other) {
  if (!me || !other) return 0;
  const mySkills = (me.teaches || []).map((t) => t.skill.toLowerCase());
  const myWants = (me.learns || []).map((l) => l.skill.toLowerCase());
  const theirSkills = (other.teaches || []).map((t) => t.skill.toLowerCase());
  const theirWants = (other.learns || []).map((l) => l.skill.toLowerCase());

  const theyTeachWhatIWant = myWants.filter((s) => theirSkills.includes(s)).length;
  const iTeachWhatTheyWant = theirWants.filter((s) => mySkills.includes(s)).length;
  const total = myWants.length + theirWants.length;
  if (total === 0) return 0;
  return Math.round(((theyTeachWhatIWant + iTeachWhatTheyWant) / total) * 100);
}

// Browse Skills page: fetch other users, optionally filtered, with a match % attached
export async function browseUsers({ myProfile, skillQuery, format, level, availability } = {}) {
  const usersRef = collection(db, "users");
  let snap = await getDocs(usersRef);
  let users = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((u) => u.id !== myProfile?.id)
    // Only show people who can actually swap: something to teach AND
    // something to learn. An incomplete profile isn't a real match yet.
    .filter((u) => (u.teaches || []).length > 0 && (u.learns || []).length > 0);

  if (skillQuery) {
    const q = skillQuery.toLowerCase();
    users = users.filter(
      (u) =>
        (u.teaches || []).some((t) => t.skill.toLowerCase().includes(q)) ||
        (u.learns || []).some((l) => l.skill.toLowerCase().includes(q))
    );
  }
  if (format) users = users.filter((u) => u.format === format);
  if (level) {
    users = users.filter((u) => (u.teaches || []).some((t) => t.level === level));
  }
  if (availability) {
    users = users.filter((u) => (u.availability || []).includes(availability));
  }

  return users
    .map((u) => ({ ...u, matchScore: computeMatchScore(myProfile, u) }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

/* ---------------- SWAP POSTS (the "New Swap" form) ---------------- */

export async function createSwapPost(uid, data) {
  const ref = await addDoc(collection(db, "swapPosts"), {
    ownerId: uid,
    teachSkill: data.teachSkill,
    teachLevel: data.teachLevel,
    teachFormat: data.teachFormat,
    learnSkill: data.learnSkill,
    learnLevel: data.learnLevel,
    learnFormat: data.learnFormat,
    title: data.title,
    language: data.language,
    description: data.description,
    availability: data.availability,
    status: "open",
    createdAt: serverTimestamp(),
  });

  // Browse/Top Matches read from the user's own teaches/learns arrays, not
  // from swapPosts directly — so a new swap post needs to also land there,
  // or it's invisible everywhere except "My Swaps". Merge in (no duplicate
  // skill names) rather than blindly appending.
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const current = userSnap.data() || {};
  const teaches = current.teaches || [];
  const learns = current.learns || [];

  const hasTeach = teaches.some((t) => t.skill.toLowerCase() === data.teachSkill.toLowerCase());
  const hasLearn = learns.some((l) => l.skill.toLowerCase() === data.learnSkill.toLowerCase());

  await updateDoc(userRef, {
    teaches: hasTeach ? teaches : [...teaches, { skill: data.teachSkill, level: data.teachLevel }],
    learns: hasLearn ? learns : [...learns, { skill: data.learnSkill, level: data.learnLevel }],
  });

  return ref.id;
}

export async function getMySwapPosts(uid) {
  const q = query(collection(db, "swapPosts"), where("ownerId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteSwapPost(postId, uid) {
  const postRef = doc(db, "swapPosts", postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) return;
  const { teachSkill, learnSkill } = postSnap.data();

  await deleteDoc(postRef);

  // Best-effort cleanup: remove the matching skill tags from the profile too,
  // so a deleted swap post also disappears from Browse/Top Matches. Note: if
  // you added the same skill another way (Edit Profile, or a second swap
  // post), this still removes it — there's no tracking of which source added
  // which skill, so treat this as "this skill is gone" rather than surgical.
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const current = userSnap.data() || {};
  await updateDoc(userRef, {
    teaches: (current.teaches || []).filter((t) => t.skill.toLowerCase() !== teachSkill.toLowerCase()),
    learns: (current.learns || []).filter((l) => l.skill.toLowerCase() !== learnSkill.toLowerCase()),
  });
}

/* ---------------- SWAP REQUESTS (Active / Request / Completed tabs) ---------------- */

// A swapRequest connects two users: { fromUserId, toUserId, teachSkill, learnSkill, status }
// status: "pending" | "accepted" | "declined" | "completed"

export async function sendSwapRequest({ fromUserId, toUserId, teachSkill, learnSkill }) {
  if (fromUserId === toUserId) {
    throw new Error("You can't send a swap request to yourself.");
  }
  const ref = await addDoc(collection(db, "swapRequests"), {
    fromUserId,
    toUserId,
    teachSkill,
    learnSkill,
    status: "pending",
    nextSession: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function respondToSwapRequest(requestId, accept) {
  await updateDoc(doc(db, "swapRequests", requestId), {
    status: accept ? "accepted" : "declined",
    updatedAt: serverTimestamp(),
  });
}

export async function completeSwapRequest(requestId) {
  const reqRef = doc(db, "swapRequests", requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error("Swap request not found.");
  const { fromUserId, toUserId } = reqSnap.data();

  // One atomic batch: the status change and both participants' credit (what
  // Profile.jsx's "Swaps done" stat reads) succeed or fail together.
  const batch = writeBatch(db);
  batch.update(reqRef, { status: "completed", updatedAt: serverTimestamp() });
  batch.update(doc(db, "users", fromUserId), { swapsCompleted: increment(1) });
  batch.update(doc(db, "users", toUserId), { swapsCompleted: increment(1) });
  await batch.commit();
}

/* ---------------- MEETINGS (Google Meet link on a swap) ---------------- */

// Accepts the normal Meet formats only (abc-defg-hij, or /lookup/<id>) so a
// pasted link can't point anywhere except Google Meet.
const MEET_LINK = /^https:\/\/meet\.google\.com\/(?:[a-z]{3}-[a-z]{4}-[a-z]{3}|lookup\/[A-Za-z0-9]+)(?:\?[^\s]*)?$/;

export function isValidMeetLink(link) {
  return MEET_LINK.test((link || "").trim());
}

// Saves the Meet link (and when it happens) on the swapRequest so both people
// see it. `scheduledAt` is a JS Date; pass null/undefined for an instant meeting
// (stored as "now"). Optionally drops the link into their chat thread too.
export async function saveSwapMeeting({ requestId, meetLink, scheduledAt, senderId, receiverId, note }) {
  const link = (meetLink || "").trim();
  if (!isValidMeetLink(link)) {
    throw new Error("That doesn't look like a Google Meet link (https://meet.google.com/abc-defg-hij).");
  }
  const when = scheduledAt instanceof Date ? scheduledAt : new Date();
  await updateDoc(doc(db, "swapRequests", requestId), {
    meetLink: link,
    meetType: scheduledAt ? "scheduled" : "instant",
    nextSession: Timestamp.fromDate(when),
    updatedAt: serverTimestamp(),
  });

  if (senderId && receiverId) {
    const chatId = chatIdFor(senderId, receiverId);
    const text = `${note || "Google Meet"}: ${link}`;
    await sendMessage({ chatId, senderId, receiverId, text });
  }
}

export async function clearSwapMeeting(requestId) {
  await updateDoc(doc(db, "swapRequests", requestId), {
    meetLink: null,
    meetType: null,
    nextSession: null,
    updatedAt: serverTimestamp(),
  });
}

// Fetches everything relevant to My Swaps page, split into the 3 tabs
export async function getMySwaps(uid) {
  const asSender = query(collection(db, "swapRequests"), where("fromUserId", "==", uid));
  const asReceiver = query(collection(db, "swapRequests"), where("toUserId", "==", uid));
  const [sentSnap, receivedSnap] = await Promise.all([getDocs(asSender), getDocs(asReceiver)]);

  const all = [
    ...sentSnap.docs.map((d) => ({ id: d.id, ...d.data(), direction: "sent" })),
    ...receivedSnap.docs.map((d) => ({ id: d.id, ...d.data(), direction: "received" })),
  ];

  // attach the other user's profile for display (name, avatar)
  const withOtherUser = await Promise.all(
    all.map(async (s) => {
      const otherId = s.direction === "sent" ? s.toUserId : s.fromUserId;
      const otherUser = await getUserById(otherId);
      return { ...s, otherUser };
    })
  );

  return {
    active: withOtherUser.filter((s) => s.status === "accepted"),
    requests: withOtherUser.filter((s) => s.status === "pending" && s.direction === "received"),
    completed: withOtherUser.filter((s) => s.status === "completed"),
  };
}

/* ---------------- REVIEWS ---------------- */

export async function getReviewsForUser(uid) {
  // where() + orderBy() on different fields needs a Firestore composite index.
  // Sorting client-side instead avoids that setup step entirely.
  const q = query(collection(db, "reviews"), where("toUserId", "==", uid));
  const snap = await getDocs(q);
  const reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return reviews.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

// Used to gate the review form: only let someone review a user they've
// actually completed a swap with.
export async function hasCompletedSwapWith(myUid, otherUid) {
  const asSender = query(
    collection(db, "swapRequests"),
    where("fromUserId", "==", myUid),
    where("toUserId", "==", otherUid),
    where("status", "==", "completed")
  );
  const asReceiver = query(
    collection(db, "swapRequests"),
    where("fromUserId", "==", otherUid),
    where("toUserId", "==", myUid),
    where("status", "==", "completed")
  );
  const [sentSnap, receivedSnap] = await Promise.all([getDocs(asSender), getDocs(asReceiver)]);
  return !sentSnap.empty || !receivedSnap.empty;
}

export async function submitReview({ toUserId, fromUserId, rating, text }) {
  if (!(rating >= 1 && rating <= 5)) throw new Error("Rating must be between 1 and 5.");
  const userRef = doc(db, "users", toUserId);
  const reviewRef = doc(collection(db, "reviews"));

  // Transaction: the review and the reviewed user's aggregate rating are
  // written together, so a failure can't leave a review saved without the
  // rating update (which would create a duplicate when the user retries).
  await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    const u = userSnap.data() || {};
    const newCount = (u.ratingCount || 0) + 1;
    const newRating = ((u.rating || 0) * (u.ratingCount || 0) + rating) / newCount;
    tx.set(reviewRef, { toUserId, fromUserId, rating, text, createdAt: serverTimestamp() });
    tx.update(userRef, { rating: newRating, ratingCount: newCount });
  });
}

/* ---------------- CHAT ---------------- */

// Deterministic chat id so two users always land in the same thread
export function chatIdFor(uidA, uidB) {
  return [uidA, uidB].sort().join("_");
}

export async function ensureChatExists(uidA, uidB) {
  const chatId = chatIdFor(uidA, uidB);
  const ref = doc(db, "chats", chatId);
  await setDoc(ref, { participants: [uidA, uidB] }, { merge: true });
  return chatId;
}

export async function getMyChats(uid) {
  const q = query(collection(db, "chats"), where("participants", "array-contains", uid));
  const snap = await getDocs(q);
  const chats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return Promise.all(
    chats.map(async (c) => {
      const otherId = c.participants.find((p) => p !== uid);
      const otherUser = await getUserById(otherId);
      return { ...c, otherUser };
    })
  );
}

// Real-time listener for one chat's messages — call this in a useEffect
export function listenToMessages(chatId, callback) {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc"),
    limit(200)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function sendMessage({ chatId, senderId, receiverId, text }) {
  const chatRef = doc(db, "chats", chatId);
  // setDoc with merge:true creates the chat doc on first message, or updates
  // it on every message after — one code path instead of a fragile
  // "try update, fall back to create" branch.
  await setDoc(
    chatRef,
    {
      participants: [senderId, receiverId],
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
    },
    { merge: true }
  );
  await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });
}

/* ---------------- SWAP HISTORY (Profile page's "Wants to learn" / history list) ---------------- */

// Every swapRequest the user has been part of, newest first, with the other
// user's name attached — this is what Profile.jsx's history section reads.
export async function getUserSwapHistory(uid) {
  const asSender = query(collection(db, "swapRequests"), where("fromUserId", "==", uid));
  const asReceiver = query(collection(db, "swapRequests"), where("toUserId", "==", uid));
  const [sentSnap, receivedSnap] = await Promise.all([getDocs(asSender), getDocs(asReceiver)]);

  const all = [
    ...sentSnap.docs.map((d) => ({ id: d.id, ...d.data(), direction: "sent" })),
    ...receivedSnap.docs.map((d) => ({ id: d.id, ...d.data(), direction: "received" })),
  ];

  const withOtherUser = await Promise.all(
    all
      .filter((s) => s.status === "accepted" || s.status === "completed")
      .map(async (s) => {
        const otherId = s.direction === "sent" ? s.toUserId : s.fromUserId;
        const otherUser = await getUserById(otherId);
        return { ...s, otherUser };
      })
  );

  return withOtherUser.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
}

/* ---------------- RECENT ACTIVITY (Home dashboard feed) ---------------- */

// Pulls the 3 most recent things worth telling the user about: an accepted
// swap, a new chat message, and a pending review — combined and sorted.
export async function getRecentActivity(uid) {
  const items = [];

  // Recently accepted/completed swaps
  const { active, completed, requests } = await getMySwaps(uid);
  active.slice(0, 2).forEach((s) => {
    items.push({
      type: "swap_accepted",
      text: `${s.otherUser?.name || "Someone"} accepted your swap request`,
      detail: `${s.teachSkill} ⇆ ${s.learnSkill}`,
      timestamp: s.updatedAt,
    });
  });

  // Pending reviews to leave (completed swaps you haven't reviewed yet)
  completed.slice(0, 2).forEach((s) => {
    items.push({
      type: "review_pending",
      text: `Leave a review for ${s.otherUser?.name || "your swap partner"}`,
      detail: `Your ${s.teachSkill} swap is complete — share your feedback`,
      timestamp: s.updatedAt,
    });
  });

  // Most recent chat message across all threads
  const chats = await getMyChats(uid);
  const sortedChats = chats
    .filter((c) => c.lastMessageAt)
    .sort((a, b) => (b.lastMessageAt?.seconds || 0) - (a.lastMessageAt?.seconds || 0));
  if (sortedChats[0]) {
    items.push({
      type: "message",
      text: `New message from ${sortedChats[0].otherUser?.name || "someone"}`,
      detail: sortedChats[0].lastMessage,
      timestamp: sortedChats[0].lastMessageAt,
    });
  }

  return items
    .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
    .slice(0, 5);
}

/* ---------------- HOME DASHBOARD AGGREGATES ---------------- */

export async function getDashboardData(uid) {
  const { active, requests } = await getMySwaps(uid);
  const myProfile = await getUserById(uid);
  const topMatches = await browseUsers({ myProfile });
  const recentActivity = await getRecentActivity(uid);

  return {
    newMatchesCount: topMatches.filter((u) => u.matchScore > 50).length,
    upcomingSessionsCount: active.length,
    pendingReviewCount: requests.length,
    topMatches: topMatches.slice(0, 3),
    recentActivity,
  };
}
