"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Send, FileSearch, Loader, Divide } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    {
      role: "assistant",
      content:
        "저는 주택청약과 관련된 정보와 질문에 대한 답변을 도와드릴 수 있습니다. 청약 자격, 거주의무, 우선공급 조건 등 다양한 주제에 대해 설명해 드릴 수 있습니다. 궁금한 점이 있으시면 언제든지 질문해 주세요!",
    },
  ]);
  const [message, setMessage] = useState<Message>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDone, setIsDone] = useState(true);

  // 파일 이름 배열
  const [fileNames, setFileNames] = useState([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 사용자의 신규 메시지가 추가되면 맨 밑으로 스크롤 이동
    handleScrollToBottom();
  }, [messages]);

  // 메시지 전송 함수
  const sendMessage = ({ role, content }: Message) => {
    setMessages((prev) => [...prev, { role, content }]);
    if (role === "user") {
      setMessage({ role: "user", content: "" });
    }
  };

  // ChatBot API 응답 요청 함수
  const requestChatResponse = (message: string) => {
    fetch("http://localhost:8000/question/" + message)
      .then((response) => response.json())
      .then((response: ApiResponse) => {
        sendMessage({ role: "assistant", content: response.content });
        setDocuments(response.documents);
        setIsDone(true);
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
      <div className="flex justify-center mx-auto mt-5">
        <div>
          <Card className="flex flex-col w-[700px] h-[700px] rounded-r-none">
            <Menubar className="border-t-0 border-s-0 border-r-0">
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    New Window <MenubarShortcut>⌘N</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem disabled>New Incognito Window</MenubarItem>
                  <MenubarSeparator />
                  <MenubarSub>
                    <MenubarSubTrigger>Share</MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarItem>Email link</MenubarItem>
                      <MenubarItem>Messages</MenubarItem>
                      <MenubarItem>Notes</MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
                  <MenubarSeparator />
                  <MenubarItem>
                    Print... <MenubarShortcut>⌘P</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarSub>
                    <MenubarSubTrigger>Find</MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarItem>Search the web</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>Find...</MenubarItem>
                      <MenubarItem>Find Next</MenubarItem>
                      <MenubarItem>Find Previous</MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
                  <MenubarSeparator />
                  <MenubarItem>Cut</MenubarItem>
                  <MenubarItem>Copy</MenubarItem>
                  <MenubarItem>Paste</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                  <MenubarCheckboxItem>
                    Always Show Bookmarks Bar
                  </MenubarCheckboxItem>
                  <MenubarCheckboxItem checked>
                    Always Show Full URLs
                  </MenubarCheckboxItem>
                  <MenubarSeparator />
                  <MenubarItem inset>
                    Reload <MenubarShortcut>⌘R</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem disabled inset>
                    Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem inset>Toggle Fullscreen</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem inset>Hide Sidebar</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Profiles</MenubarTrigger>
                <MenubarContent>
                  <MenubarRadioGroup value="benoit">
                    <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
                    <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
                    <MenubarRadioItem value="Luis">Luis</MenubarRadioItem>
                  </MenubarRadioGroup>
                  <MenubarSeparator />
                  <MenubarItem inset>Edit...</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem inset>Add Profile...</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
            <CardHeader>
              <CardTitle>AI 도우미</CardTitle>
              <CardDescription>
                <p>주택청약 궁금하신 점 있으시면 무엇이든 물어보세요.</p>
                <p>
                  <a
                    href="https://www.molit.go.kr/portal.do"
                    className="font-medium underline underline-offset-4"
                    target="_blank"
                  >
                    국토교통부
                  </a>
                  의 2024년 5월 주택청약 FAQ 문서 기반으로 답변해드립니다.
                </p>
              </CardDescription>
            </CardHeader>

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
                      {message.role === "user" ? (
                        <AvatarImage src="https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png" />
                      ) : (
                        <AvatarImage src="https://cdn.pixabay.com/photo/2019/09/13/15/32/graduation-4474213_960_720.png" />
                      )}
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
                {!isDone && (
                  <div className="flex justify-start">
                    <Loader className="w-6 h-6 animate-spin" />
                    <p className="text-sm text-muted-foreground mt-0.5 ms-1">
                      답변을 작성하고 있습니다...
                    </p>
                  </div>
                )}
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
                      if (isDone) {
                        setIsDone(false);
                        sendMessage({
                          role: "user",
                          content: message?.content || "",
                        });

                        requestChatResponse(message?.content || "");
                      }
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

        <Card className="w-[600px] border-s-0 rounded-b-none rounded-s-none ms-0">
          <CardHeader>
            <CardTitle>참고 문서</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <Tabs defaultValue="markdown" className="h-full">
              <TabsList>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
                <TabsTrigger value="pdf">PDF</TabsTrigger>
              </TabsList>
              {/* 마크다운 */}
              <TabsContent value="markdown" className="h-full">
                {documents.length <= 0 && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div>
                      <div className="flex justify-center">
                        <FileSearch size={48} className="mb-2" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI 도우미에게 질문하시면 관련 문서를 찾아드려요.
                      </p>
                    </div>
                  </div>
                )}
                <Accordion type="single" collapsible className="w-full">
                  {documents.map((document, index) => (
                    <AccordionItem value={document.page_content} key={index}>
                      <AccordionTrigger>관련 문서 {index + 1}</AccordionTrigger>
                      <AccordionContent className="w-full overflow-hidden">
                        <Textarea
                          className="h-96 mt-1 w-[98%] mx-auto"
                          readOnly
                          value={document.page_content}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              {/* PDF */}
              <TabsContent value="pdf" className="h-full">
                <div className="h-full">
                  <div className="w-full h-[100%] flex items-center justify-center">
                    <div>
                      <div className="flex justify-center">
                        <FileSearch size={48} className="mb-2" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI 도우미에게 질문하시면 관련 문서를 찾아드려요.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Home;
