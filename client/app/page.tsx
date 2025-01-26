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
import { Send, FileSearch, Loader } from "lucide-react";

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

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

import ReactMarkdown from "react-markdown";

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
  markdown: string;
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

  // 임시 마크다운
  const [markdown, setMarkdown] = useState("");

  // 임시 이미지
  const [image, setImage] = useState();
  const [image2, setImage2] = useState();
  const [image3, setImage3] = useState();

  // 파일 이름 배열
  const [fileNames, setFileNames] = useState([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 사용자의 신규 메시지가 추가되면 맨 밑으로 스크롤 이동
    handleScrollToBottom();
  }, [messages]);

  const fetchImage = (documents: Document[]) => {
    fetch("http://localhost:8000/image/" + (documents[0].metadata.page + 1))
      .then((response) => response.blob())
      .then((blob) => setImage(URL.createObjectURL(blob)));

    fetch("http://localhost:8000/image/" + (documents[1].metadata.page + 1))
      .then((response) => response.blob())
      .then((blob) => setImage2(URL.createObjectURL(blob)));

    fetch("http://localhost:8000/image/" + (documents[2].metadata.page + 1))
      .then((response) => response.blob())
      .then((blob) => setImage3(URL.createObjectURL(blob)));
  };

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
        // 임시 마크다운
        setMarkdown(response.markdown);
        // 임시 이미지 설정
        fetchImage(response.documents);
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

  // JSON
  const formatJson = (medatadata: Metadata) => {
    return JSON.stringify(medatadata, null, 2);
  };

  const handleMessageSendClick = () => {};

  return (
    <div className="h-screen pt-10">
      <div className="flex justify-center">
        <div>
          <Card className="flex flex-col w-[700px] h-[705px] rounded-r-none">
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
                    {/* <p className="text-sm text-muted-foreground mt-0.5 ms-1">
                      답변을 작성하고 있습니다...
                    </p> */}
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

        <Card className="w-[600px] h-[705px] border-s-0 rounded-b-none rounded-s-none ms-0">
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between">
                <span>참고 문서</span>
                <div className="flex items-center space-x-2">
                  <Switch id="airplane-mode" defaultChecked />
                </div>
              </div>
            </CardTitle>
            <CardDescription>
              해당 기능을 켜면 AI가 요약 정리 및 어떤 문서를 참고했는지 확인할
              수 있습니다. <br />
              빠른 답변이 필요하다면 끄는 것을 추천합니다
            </CardDescription>
          </CardHeader>
          <div className="h-[560px]">
            <CardContent className="h-full w-full">
              <Tabs defaultValue="markdown" className="h-full">
                <TabsList>
                  <TabsTrigger value="markdown">요약 정리</TabsTrigger>
                  <TabsTrigger value="pdf">PDF 이미지</TabsTrigger>
                  <TabsTrigger value="metadata">메타데이터</TabsTrigger>
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
                  {documents.length > 0 && (
                    <ScrollArea className="h-[530px] w-full">
                      <div className="prose p-3">
                        <ReactMarkdown>{markdown}</ReactMarkdown>
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>
                {/* PDF */}
                <TabsContent value="pdf" className="h-full w-full">
                  <div className="h-full">
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

                    <Carousel className="w-[98%] mx-auto">
                      <CarouselContent>
                        <CarouselItem>
                          {documents.length > 0 && (
                            <ScrollArea className="h-[530px]">
                              <img src={image} className="w-full h-auto" />
                            </ScrollArea>
                          )}
                        </CarouselItem>
                        <CarouselItem>
                          {documents.length > 0 && (
                            <ScrollArea className="h-[530px]">
                              <img src={image2} className="w-full h-auto" />
                            </ScrollArea>
                          )}
                        </CarouselItem>

                        <CarouselItem>
                          {documents.length > 0 && (
                            <ScrollArea className="h-[530px]">
                              <img src={image3} className="w-full h-auto" />
                            </ScrollArea>
                          )}
                        </CarouselItem>
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </div>
                </TabsContent>
                {/* Metadata */}
                <TabsContent value="metadata" className="h-full">
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full h-full"
                  >
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

                    {documents.map((document, index) => (
                      <AccordionItem value={document.page_content} key={index}>
                        <AccordionTrigger>
                          컨텍스트 {index + 1}
                        </AccordionTrigger>
                        <AccordionContent className="w-full overflow-hidden">
                          <pre className="p-4 bg-gray-100">
                            {formatJson(document.metadata)}
                          </pre>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              </Tabs>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;
