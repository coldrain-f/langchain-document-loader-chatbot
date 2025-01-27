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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
import { Switch } from "@/components/ui/switch";

import ReactMarkdown from "react-markdown";

import type { Message, Metadata, Document } from "@/app/types/common";

const defaultMessage: Message = {
  role: "assistant",
  content:
    "저는 주택청약과 관련된 정보와 질문에 대한 답변을 도와드릴 수 있습니다. 청약 자격, 거주의무, 우선공급 조건 등 다양한 주제에 대해 설명해 드릴 수 있습니다. 궁금한 점이 있으시면 언제든지 질문해 주세요!",
};

const Home = () => {
  const [messages, setMessages] = useState<Message[]>([defaultMessage]);
  const [question, setQuestion] = useState<Message>();
  const [markdownSummary, setMarkdownSummary] = useState("");
  const [includeAdditionalInfo, setIncludeAdditionalInfo] = useState(true);
  const [pdfImageSources, setPdfImageSources] = useState<string[]>([]);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const userProfileImage =
    "https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png";
  const assistantProfileImage =
    "https://cdn.pixabay.com/photo/2019/09/13/15/32/graduation-4474213_960_720.png";

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 사용자의 신규 메시지가 추가되면 맨 밑으로 스크롤 이동
    handleScrollToBottom();
  }, [messages]);

  // Python 서버에 메시지를 전송하는 함수
  const sendMessage = (message: Message) => {
    if (isLoading || !message.content) {
      return;
    }

    setQuestion({ role: message.role, content: "" });
    setMessages((prev) => [...prev, message]);

    setIsLoading(true);

    fetch(`http://localhost:8000/api/v1/chatbot/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: message.content,
        include_additional_info: includeAdditionalInfo,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        setMarkdownSummary(res.markdown_summary);
        setDocuments(res.documents);
        setPdfImageSources(
          res.pdf_images_base64.map(
            (base64: string) => `data:image/png;base64,${base64}`
          )
        );

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.answer },
        ]);

        setIsLoading(false);
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

  return (
    <div className="h-screen pt-10">
      <div className="flex justify-center">
        <div>
          <Card className="flex flex-col w-[700px] h-[705px] rounded-r-none">
            <Menubar className="border-s-0 border-t-0 border-r-0 rounded-b-none rounded-r-none">
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
                        <AvatarImage src={userProfileImage} />
                      ) : (
                        <AvatarImage src={assistantProfileImage} />
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

                {isLoading && (
                  <div className="flex justify-start">
                    <Loader className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </div>
            </ScrollArea>

            <CardContent className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={question?.content || ""}
                  onChange={(e) =>
                    setQuestion({ role: "user", content: e.target.value })
                  }
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      sendMessage({
                        role: "user",
                        content: question?.content || "",
                      });
                    }
                  }}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  onClick={() =>
                    sendMessage({
                      role: "user",
                      content: question?.content || "",
                    })
                  }
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
                  <Switch
                    checked={includeAdditionalInfo}
                    onCheckedChange={(checked) =>
                      setIncludeAdditionalInfo(checked)
                    }
                  />
                </div>
              </div>
            </CardTitle>
            <CardDescription>
              해당 기능을 켜면 AI가 요약 정리 및 어떤 문서를 참고했는지 확인할
              수 있습니다. <br />
              신속한 답변이 필요하시다면 끄는 것을 권장합니다
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
                  {documents.length <= 0 || !markdownSummary ? (
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
                  ) : (
                    <ScrollArea className="h-[530px] w-full">
                      <div className="prose p-3">
                        <ReactMarkdown>{markdownSummary}</ReactMarkdown>
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>
                {/* PDF */}
                <TabsContent value="pdf" className="h-full w-full">
                  <div className="h-full">
                    {documents.length <= 0 || !markdownSummary ? (
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
                    ) : (
                      <Carousel className="w-[98%] mx-auto">
                        <CarouselContent>
                          {pdfImageSources.map((source, index) => (
                            <CarouselItem key={source}>
                              <ScrollArea className="h-[530px]">
                                <img src={source} alt={`PDF Image ${index}`} />
                              </ScrollArea>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                    )}
                  </div>
                </TabsContent>
                {/* Metadata */}
                <TabsContent value="metadata" className="h-full">
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full h-full"
                  >
                    {documents.length <= 0 || !markdownSummary ? (
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
                    ) : (
                      <div>
                        {documents.map((document, index) => (
                          <AccordionItem
                            value={document.page_content}
                            key={index}
                          >
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
                      </div>
                    )}
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
