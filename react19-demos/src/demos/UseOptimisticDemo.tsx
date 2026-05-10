/**
 * React 19 useOptimistic 演示
 * useOptimistic 用于实现乐观更新，让用户操作后立即看到结果
 */

import { useOptimistic, useState, useRef } from 'react';

// 消息类型定义
interface Message {
  id: number;
  text: string;
  sending?: boolean;
}

// 模拟发送消息到服务器
async function sendMessageToServer(text: string): Promise<Message> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    id: Date.now(),
    text,
    sending: false
  };
}

export default function UseOptimisticDemo() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: '你好！这是 React 19 演示' },
    { id: 2, text: 'useOptimistic 让界面响应更流畅' }
  ]);

  // useOptimistic 接收当前状态和更新函数
  // 返回 [optimisticState, addOptimistic]
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state: Message[], newMessage: string) => [
      ...state,
      {
        id: Date.now(),
        text: newMessage,
        sending: true // 乐观更新时标记为发送中
      }
    ]
  );

  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(formData: FormData) {
    const text = formData.get('message') as string;
    if (!text.trim()) return;

    // 1. 立即执行乐观更新 - UI 立即响应
    addOptimisticMessage(text);

    // 清空输入框
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    // 2. 实际发送请求
    const sentMessage = await sendMessageToServer(text);

    // 3. 更新实际状态
    setMessages(prev => [...prev, sentMessage]);
  }

  return (
    <div className="demo-container">
      <h2>React 19 useOptimistic 演示</h2>
      <p className="intro">
        useOptimistic 让你可以在等待服务器响应时立即更新 UI，
        提供更流畅的用户体验。如果请求失败，会自动回滚到之前的状态。
      </p>

      <div className="chat-demo">
        <div className="messages-list">
          {optimisticMessages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.sending ? 'sending' : ''}`}
            >
              <span className="message-text">{msg.text}</span>
              {msg.sending && (
                <span className="sending-indicator">发送中...</span>
              )}
            </div>
          ))}
        </div>

        <form action={handleSubmit} className="message-form">
          <input
            ref={inputRef}
            type="text"
            name="message"
            placeholder="输入消息..."
            className="input-field"
          />
          <button type="submit" className="submit-btn">
            发送
          </button>
        </form>
      </div>

      <div className="code-explanation">
        <h4>工作原理：</h4>
        <ol>
          <li>
            <strong>乐观更新</strong> - 用户点击发送后，消息立即显示在列表中
            （带有"发送中"标记）
          </li>
          <li>
            <strong>后台请求</strong> - 同时向服务器发送实际请求
          </li>
          <li>
            <strong>状态同步</strong> - 服务器响应后，更新实际状态
          </li>
          <li>
            <strong>自动回滚</strong> - 如果请求失败，乐观更新会自动回滚
          </li>
        </ol>
      </div>

      <div className="feature-highlight">
        <h4>useOptimistic 的优势：</h4>
        <ul>
          <li>✅ 即时反馈 - 用户无需等待服务器响应</li>
          <li>✅ 自动管理 - 无需手动处理回滚逻辑</li>
          <li>✅ 类型安全 - 与 TypeScript 完美配合</li>
          <li>✅ 简洁 API - 只需一行代码即可实现乐观更新</li>
        </ul>
      </div>
    </div>
  );
}
