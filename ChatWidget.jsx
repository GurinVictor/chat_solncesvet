import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: `Добрый день! Я помогу подобрать курс.\n\n🟡 Напишите, пожалуйста:\n– Кем вы работаете (учитель, воспитатель, логопед и т.д.)\n– И по какой теме хотите пройти курс (например, ФГОС, ОВЗ, ИКТ, воспитательная работа...)\n\nЯ сразу подберу подходящие программы 📋`
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const webhookUrl = "https://guru-ai.online/webhook/8c4fc611-0a48-4dd8-8a15-c90fac2556c0";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newUserMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");

    try {
      const res = await axios.post(webhookUrl, {
        message: input
      });

      const botReply = res.data?.message || "Спасибо! Я обрабатываю ваш запрос.";
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { sender: "bot", text: "Ошибка соединения с сервером." }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-[#FFF6E4] rounded-xl shadow-md h-[90vh] flex flex-col">
      <h2 className="text-xl font-bold text-white bg-[#F6A400] p-3 rounded-md">Подбор курса за 2 минуты</h2>
      <div className="flex-1 overflow-y-auto mt-3 mb-2 space-y-2 px-2">
        {messages.map((msg, i) => (
          <div
            key={i}
className={
  "max-w-[80%] p-3 rounded-lg whitespace-pre-line text-sm leading-snug " +
  (msg.sender === "user"
    ? "bg-white self-end text-black border border-gray-200"
    : "bg-[#FFF2C8] self-start text-black border border-gray-300")
}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center gap-2">
        <textarea
          rows={2}
          className="flex-1 p-2 rounded border border-gray-300 text-sm resize-none"
          placeholder="Напишите сообщение..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={sendMessage}
          className="bg-[#F6A400] text-white px-4 py-2 rounded hover:opacity-90"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
