'use client'

import Navigation from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import type { Expert, Message } from "@/types"
import Image from "next/image"

export default function MessagesPage() {
  const { user } = useUser()
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [experts, setExperts] = useState<Expert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch experts and messages from API
    // This is mock data for now
    setExperts([
      {
        id: "exp_1",
        name: "Sarah Johnson",
        role: "Senior Marketing Strategist",
        avatar: "/experts/sarah.jpg",
        expertise: ["B2B Marketing", "Content Strategy", "Lead Generation"],
        available: true,
      },
      {
        id: "exp_2",
        name: "Michael Chen",
        role: "Growth Marketing Expert",
        avatar: "/experts/michael.jpg",
        expertise: ["SaaS Marketing", "SEO", "Paid Advertising"],
        available: true,
      },
    ])

    setLoading(false)
  }, [])

  useEffect(() => {
    if (selectedExpert) {
      // TODO: Fetch messages for selected expert
      setMessages([
        {
          id: "msg_1",
          userId: user?.id || "",
          expertId: selectedExpert.id,
          content: "Hi, I need help with my content strategy.",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          read: true,
        },
        {
          id: "msg_2",
          userId: selectedExpert.id,
          expertId: selectedExpert.id,
          content: "I'd be happy to help! Could you tell me more about your current content approach?",
          createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
          read: true,
        },
      ])
    }
  }, [selectedExpert, user?.id])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedExpert) return

    const message: Message = {
      id: `msg_${Date.now()}`,
      userId: user?.id || "",
      expertId: selectedExpert.id,
      content: newMessage,
      createdAt: new Date(),
      read: false,
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-[#2a2a2a]">Loading...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="relative isolate pt-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Experts List */}
            <div className="lg:col-span-1">
              <h2 className="mb-6 text-xl font-semibold text-[#111111]">
                Marketing Experts
              </h2>
              <div className="space-y-4">
                {experts.map((expert) => (
                  <button
                    key={expert.id}
                    onClick={() => setSelectedExpert(expert)}
                    className={`w-full rounded-lg border p-4 text-left transition-all ${
                      selectedExpert?.id === expert.id
                        ? "border-[#111111] bg-[#f6f6f6]"
                        : "border-[#dcdcdc] hover:border-[#111111]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12">
                        <Image
                          src={expert.avatar}
                          alt={expert.name}
                          fill
                          className="rounded-full object-cover"
                        />
                        {expert.available && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#111111]">{expert.name}</h3>
                        <p className="text-sm text-[#2a2a2a]">{expert.role}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3">
              {selectedExpert ? (
                <div className="flex h-[calc(100vh-12rem)] flex-col rounded-lg border border-[#dcdcdc] bg-white">
                  {/* Chat Header */}
                  <div className="border-b border-[#dcdcdc] p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12">
                        <Image
                          src={selectedExpert.avatar}
                          alt={selectedExpert.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#111111]">{selectedExpert.name}</h3>
                        <p className="text-sm text-[#2a2a2a]">{selectedExpert.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.userId === user?.id ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              message.userId === user?.id
                                ? "bg-[#111111] text-white"
                                : "bg-[#f6f6f6] text-[#111111]"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className="mt-1 text-xs opacity-70">
                              {message.createdAt.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-[#dcdcdc] p-4">
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 rounded-md border border-[#dcdcdc] px-3 py-2 focus:border-[#111111] focus:outline-none"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button onClick={handleSendMessage}>Send</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-[calc(100vh-12rem)] items-center justify-center rounded-lg border border-[#dcdcdc] bg-white">
                  <div className="text-center">
                    <p className="text-[#2a2a2a]">Select an expert to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 