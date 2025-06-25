import { Message } from '@/lib/types';

export default function Home() {
  const testMessage: Message = {
    id: "test-1",
    role: "assistant",
    content: "Hello! Types are working correctly!",
    timestamp: new Date(),
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Learning Assistant</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p><strong>Message ID:</strong> {testMessage.id}</p>
        <p><strong>Role:</strong> {testMessage.role}</p>
        <p><strong>Content:</strong> {testMessage.content}</p>
        <p><strong>Time:</strong> {testMessage.timestamp.toLocaleTimeString()}</p>
      </div>
    </div>
  );
}