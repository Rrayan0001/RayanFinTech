"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge"
import {
  Blocks,
  ChevronsUpDown,
  FileClock,
  GraduationCap,
  Layout,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  MessagesSquare,
  Plus,
  Settings,
  UserCircle,
  UserCog,
  UserSearch,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.5rem", // Slightly wider to accommodate icons comfortably
  },
};

const contentVariants = {
  open: { opacity: 1 },
  closed: { opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};


export function SessionNavBar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) {
  const pathname = ""; // Mock for compatibility if needed

  const NavItem = ({ id, label, icon: Icon, badge }) => {
    const isActive = activeTab === id;
    return (
      <div
        onClick={() => setActiveTab(id)}
        className={cn(
          "flex h-9 w-full flex-row items-center rounded-md px-2 py-2 transition hover:bg-muted hover:text-primary cursor-pointer",
          isActive && "bg-muted text-blue-600",
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-blue-600")} />
        <motion.li variants={variants} className="list-none flex items-center">
          {!isCollapsed && (
            <div className="ml-2 flex items-center gap-2">
              <p className="text-sm font-medium whitespace-nowrap">{label}</p>
              {badge && (
                <Badge
                  className="flex h-fit w-fit items-center gap-1.5 rounded border-none bg-blue-50 px-1.5 text-blue-600 dark:bg-blue-700 dark:text-blue-300"
                  variant="outline"
                >
                  {badge}
                </Badge>
              )}
            </div>
          )}
        </motion.li>
      </div>
    );
  };

  return (
    <motion.div
      className={cn(
        "sidebar fixed left-0 z-40 h-full shrink-0 border-r bg-white dark:bg-black",
      )}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className="relative z-40 flex text-muted-foreground h-full shrink-0 flex-col transition-all"
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col list-none p-0 m-0">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[54px] w-full shrink-0 border-b p-2">
              <div className="mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full outline-none" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-fit items-center gap-2 px-2" 
                    >
                      <Avatar className='rounded size-4'>
                        <AvatarFallback>O</AvatarFallback>
                      </Avatar>
                      <motion.li
                        variants={variants}
                        className="flex w-fit items-center gap-2 list-none"
                      >
                        {!isCollapsed && (
                          <>
                            <p className="text-sm font-medium">Organization</p>
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                      <UserCog className="h-4 w-4" /> Manage members
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                      <Blocks className="h-4 w-4" /> Integrations
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                      <Plus className="h-4 w-4" /> Create or join
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex h-full w-full flex-col overflow-hidden">
              <div className="flex grow flex-col gap-4 overflow-hidden">
                <ScrollArea className="grow p-2">
                  <div className="flex w-full flex-col gap-1">
                    <NavItem id="overview" label="Dashboard" icon={LayoutDashboard} />
                    <NavItem id="transactions" label="Reports" icon={FileClock} />
                    <NavItem id="chat" label="Chat" icon={MessagesSquare} badge="BETA" />
                    <Separator className="w-full my-1" />
                    <NavItem id="deals" label="Deals" icon={Layout} />
                    <NavItem id="accounts" label="Accounts" icon={UserCircle} />
                    <NavItem id="competitors" label="Competitors" icon={UserSearch} />
                    <Separator className="w-full my-1" />
                    <NavItem id="knowledge" label="Knowledge Base" icon={GraduationCap} />
                    <NavItem id="insights" label="Feedback" icon={MessageSquareText} />
                    <NavItem id="review" label="Document Review" icon={FileClock} />
                  </div>
                </ScrollArea>
              </div>
              
              <div className="flex flex-col p-2 border-t mt-auto">
                <div className="flex h-9 w-full flex-row items-center rounded-md px-2 py-2 transition hover:bg-muted hover:text-primary cursor-pointer">
                  <Settings className="h-4 w-4 shrink-0" />
                  <motion.li variants={variants} className="list-none">
                    {!isCollapsed && <p className="ml-2 text-sm font-medium">Settings</p>}
                  </motion.li>
                </div>
                <div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="w-full outline-none">
                      <div className="flex h-9 w-full flex-row items-center gap-2 rounded-md px-2 py-2 transition hover:bg-muted hover:text-primary cursor-pointer">
                        <Avatar className="size-4">
                          <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                        <motion.li
                          variants={variants}
                          className="flex w-full items-center gap-2 list-none"
                        >
                          {!isCollapsed && (
                            <>
                              <p className="text-sm font-medium">Account</p>
                              <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50" />
                            </>
                          )}
                        </motion.li>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={5}>
                      <div className="flex flex-row items-center gap-2 p-2">
                        <Avatar className="size-6">
                          <AvatarFallback>AL</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium">Andrew Luo</span>
                          <span className="line-clamp-1 text-xs text-muted-foreground">andrew@usehindsight.com</span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                        <UserCircle className="h-4 w-4" /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                        <LogOut className="h-4 w-4" /> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}
