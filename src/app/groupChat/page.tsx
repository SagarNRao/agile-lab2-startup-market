"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Message = {
  id: number;
  sender: string;
  content: string;
  timestamp: Date;
};

type ChatMember = {
  name: string;
  role: string;
  online: boolean;
};

type Application = {
  role: string;
  applicant: string;
  status: "pending" | "accepted" | "rejected";
};

type TeamMember = {
  name: string;
  role: string;
};

type Startup = {
  owner: string;
  password: string;
  id: number;
  name: string;
  description: string;
  roles: string;
  members: TeamMember[];
  applications: Application[];
};

interface GroupChatProps {
  startupData?: Startup;
}

export default function GroupChat({ startupData }: GroupChatProps) {
  const [startup, setStartup] = useState<Startup | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState({
    name: "",
    role: "",
  });
  const [hasJoined, setHasJoined] = useState(false);
  const [members, setMembers] = useState<ChatMember[]>([]);

  useEffect(() => {
    if (startupData) {
      setStartup(startupData);
      setMembers(
        startupData.members.map((member: TeamMember) => ({
          name: member.name,
          role: member.role,
          online: true,
        }))
      );
    }
  }, [startupData]);

  const handleJoinChat = () => {
    if (currentUser.name.trim() && currentUser.role.trim()) {
      setMembers([
        ...members,
        { ...currentUser, online: true },
      ]);
      setHasJoined(true);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser.name) return;

    const message: Message = {
      id: Date.now(),
      sender: currentUser.name,
      content: newMessage.trim(),
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  return (
    <div className="flex h-screen p-6 gap-4">
      {/* Members sidebar */}
      <Card className="w-64 h-full">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4">Team Members</h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-4">
              {members.map((member, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        member.online ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat area */}
      <Card className="flex-1 h-full">
        <CardContent className="p-4 h-full flex flex-col">
          {!hasJoined ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-72 space-y-4">
                <h2 className="text-xl font-bold text-center">Join the Chat</h2>
                <Input
                  placeholder="Your Name"
                  value={currentUser.name}
                  onChange={(e) =>
                    setCurrentUser({
                      ...currentUser,
                      name: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Your Role"
                  value={currentUser.role}
                  onChange={(e) =>
                    setCurrentUser({
                      ...currentUser,
                      role: e.target.value,
                    })
                  }
                />
                <Button
                  className="w-full"
                  onClick={handleJoinChat}
                  disabled={!currentUser.name.trim() || !currentUser.role.trim()}
                >
                  Join Chat
                </Button>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === currentUser.name
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender === currentUser.name
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{message.sender}</span>
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <form onSubmit={sendMessage} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit">Send</Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}