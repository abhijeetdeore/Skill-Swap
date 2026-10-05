// src/pages/ChatWindow.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../firebase/store/authStore";
import { listenToMessages, sendMessage, getUserById } from "../firebase/firestore";

export default function ChatWindow() {
  const { chatId } = useParams();
  const { profile } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const bottomRef = useRef(null);

  // The other user's id is the half of chatId that isn't mine (see chatIdFor)
  const otherUserId = chatId.split("_").find((id) => id !== profile?.id);

  useEffect(() => {
    if (otherUserId) getUserById(otherUserId).then(setOtherUser);
  }, [otherUserId]);

  useEffect(() => {
    const unsubscribe = listenToMessages(chatId, setMessages);
    return unsubscribe;
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage({ chatId, senderId: profile.id, receiverId: otherUserId, text });
    setText("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#FEFCE8]">
      <div className="p-4 border-b">
        <div className="font-bold">{otherUser?.name || "Chat"}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`max-w-md p-3 rounded-xl ${m.senderId === profile.id ? "bg-red-600 text-white ml-auto" : "bg-[#E8DCC0]"}`}>
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Write a message..."
          className="flex-1 border rounded-full px-4 py-3"
        />
        <button onClick={handleSend} className="bg-red-600 text-white rounded-full px-5">Send</button>
      </div>
    </div>
  );
}
