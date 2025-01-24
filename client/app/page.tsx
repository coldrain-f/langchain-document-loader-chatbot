"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Metadata {
  author: string;
  creationdate: string;
  creator: string;
  file_path: string;
  format: string;
  keywords: string;
  moddate: string;
  page: number;
  producer: string;
  source: string;
  subject: string;
  title: string;
  total_pages: number;
  trapped: string;
}

interface Document {
  metadata: Metadata;
  page_content: string;
}

interface ApiResponse {
  documents: Document[];
  content: string;
}

const Home = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "안녕하세요! 무엇을 도와드릴까요?" },
  ]);
  const [message, setMessage] = useState<Message>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 사용자의 신규 메시지가 추가되면 맨 밑으로 스크롤 이동
    handleScrollToBottom();
  }, [messages]);

  // 메시지 전송 함수
  const sendMessage = ({ role, content }: Message) => {
    setMessages((prev) => [...prev, { role, content }]);
    setMessage({ role: "user", content: "" });
  };

  // ChatBot API 응답 요청 함수
  const requestChatResponse = (message: string) => {
    fetch("http://localhost:8000/question/" + message)
      .then((response) => response.json())
      .then((response: ApiResponse) => {
        sendMessage({ role: "assistant", content: response.content });
      });
  };

  // 스크롤 맨 하단으로 이동하는 함수
  const handleScrollToBottom = () => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  };

  const handleMessageSendClick = () => {};

  return (
    <>
      <div className="flex justify-center gap-5 ms-5 mr-5 mt-5">
        <div>
          <Card className="flex flex-col w-[700px] h-[600px]">
            <ScrollArea className="flex-1 p-4">
              <div ref={scrollRef}>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 mb-4 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-sm">
                        {message.role === "user" ? "U" : "A"}
                      </div>
                    </Avatar>
                    <div
                      className={`rounded-lg px-3 py-2 max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <CardContent className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={message?.content || ""}
                  onChange={(e) =>
                    setMessage({ role: "user", content: e.target.value })
                  }
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      sendMessage({
                        role: "user",
                        content: message?.content || "",
                      });
                      requestChatResponse(message?.content || "");
                    }
                  }}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  onClick={handleMessageSendClick}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="w-[600px]">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>관련 문서 1</AccordionTrigger>
              <AccordionContent>
                <Textarea
                  className="h-48 w-[580px] m-auto mt-5 mb-5"
                  value={documents[0]}
                  readOnly
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>관련 문서 2</AccordionTrigger>
              <AccordionContent>
                <Textarea
                  className="h-48 w-[580px] m-auto mt-5 mb-5"
                  value={documents[1]}
                  readOnly
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>관련 문서 3</AccordionTrigger>
              <AccordionContent>
                <Textarea
                  className="h-48 w-[580px] m-auto mt-5 mb-5"
                  value={documents[2]}
                  readOnly
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
};

export default Home;
