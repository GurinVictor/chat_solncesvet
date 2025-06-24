import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const webhookUrl = "https://guru-ai.online/webhook/d55b53fc-6750-4521-a02a-2949eac00dc9/chat";

  // Получаем или создаём sessionId
  const getOrCreateSessionId = () => {
    const existing = localStorage.getItem("sessionId");
    if (existing) return existing;
    const newId = crypto.randomUUID();
    localStorage.setItem("sessionId", newId);
    return newId;
  };
  const sessionId = getOrCreateSessionId();

  // Загружаем историю при первом рендере
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Если история пустая, добавляем приветственное сообщение
      setMessages([
        {
          sender: "bot",
          text: `Добрый день! Я помогу подобрать курс.\n\n🟡 Напишите, пожалуйста:\n– Кем вы работаете (учитель, воспитатель, логопед и т.д.)\n– И по какой теме хотите пройти курс (например, ФГОС, ОВЗ, ИКТ, воспитательная работа...)\n\nЯ сразу подберу подходящие программы 📋`
        }
      ]);
    }
  }, []);

  // Сохраняем историю при каждом обновлении сообщений
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newUserMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post(webhookUrl, {
        chatInput: input,
        sessionId: sessionId
      });

      console.log("Ответ от сервера:", res.data);

      let botReply = "Спасибо! Я обрабатываю ваш запрос.";

      if (Array.isArray(res.data) && res.data[0]?.output) {
        botReply = res.data[0].output;
      } else if (typeof res.data === "object" && res.data.output) {
        botReply = res.data.output;
      } else if (typeof res.data === "string") {
        try {
          const parsed = JSON.parse(res.data);
          if (Array.isArray(parsed) && parsed[0]?.output) {
            botReply = parsed[0].output;
          } else if (parsed.output) {
            botReply = parsed.output;
          }
        } catch (e) {
          console.warn("Ошибка парсинга строки:", e);
        }
      }

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "Ошибка соединения с сервером." }]);
    } finally {
      setIsTyping(false);
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
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={
                "max-w-[80%] p-3 rounded-lg whitespace-pre-line text-sm leading-snug " +
                (msg.sender === "user"
                  ? "bg-white text-black border border-gray-200"
                  : "bg-[#FFF2C8] text-black border border-gray-300")
              }
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-xs italic text-gray-500 px-2">Виктория печатает…</div>
        )}
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
