"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Heart, MessageCircle, Volume2, Volume1, VolumeX, Music, Wifi } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMobile } from "@/hooks/use-mobile"
// import { usePostStore } from "@/hooks/use-post-store"

type IslandState = "normal" | "notification" | "settings" | "music" | "network"
type NotificationMode = "all" | "mentions" | "none"

interface Notification {
  id: string
  type: string
  user: string
  content: string
  avatar: string
}

interface DynamicIslandProps {
  notification?: Notification | null
  onDismiss?: () => void
  isScrolling: boolean
}

export function DynamicIsland({ notification, onDismiss, isScrolling }: DynamicIslandProps) {
  const [state, setState] = useState<IslandState>("normal")
  const [notificationMode, setNotificationMode] = useState<NotificationMode>("all")
  const isMobile = useMobile()
//   const { posts } = usePostStore()
  const [networkStatus, setNetworkStatus] = useState<"online" | "offline">("online")
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState({ title: "Decentralized Beats", artist: "Web3 Artist" })

  // Handle notification state changes
  useEffect(() => {
    if (notification && !isScrolling && shouldShowNotification(notification)) {
      setState("notification")

      // Auto return to normal state after 4 seconds
      const timer = setTimeout(() => {
        setState("normal")
        if (onDismiss) onDismiss()
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [notification, onDismiss, isScrolling])

  // Reset to normal state when scrolling
  useEffect(() => {
    if (isScrolling && state !== "normal") {
      setState("normal")
    }
  }, [isScrolling, state])

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus("online")
      setState("network")

      // Return to normal after 3 seconds
      setTimeout(() => {
        setState("normal")
      }, 3000)
    }

    const handleOffline = () => {
      setNetworkStatus("offline")
      setState("network")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Simulate music player
  const toggleMusic = () => {
    setMusicPlaying(!musicPlaying)
    setState(musicPlaying ? "normal" : "music")
  }

  const shouldShowNotification = (notification: Notification) => {
    if (notificationMode === "all") return true
    if (notificationMode === "mentions" && notification.type === "mention") return true
    return false
  }

  const toggleSettings = () => {
    setState(state === "settings" ? "normal" : "settings")
  }

  const getIcon = () => {
    if (!notification) return null

    switch (notification.type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case "mention":
        return <span className="text-blue-500 font-semibold">@</span>
      default:
        return null
    }
  }

  const getNotificationModeIcon = () => {
    switch (notificationMode) {
      case "all":
        return <Volume2 className="h-5 w-5 text-white" />
      case "mentions":
        return <Volume1 className="h-5 w-5 text-white" />
      case "none":
        return <VolumeX className="h-5 w-5 text-white" />
    }
  }

  return (
    <motion.div
      className="fixed z-50 flex items-center justify-center"
      initial={{ translateX: "-50%" }}
      animate={{
        translateX: "-50%",
        width: state === "normal" ? 140 : state === "music" ? 320 : 300,
        height: state === "normal" ? 36 : 68,
        top: isMobile ? 80 : 24, // Adjusted position for mobile to avoid header overlap
        left: "50%",
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
    >
      <motion.div
        className="bg-zinc-900 dark:bg-zinc-800 rounded-full w-full h-full flex items-center justify-center overflow-hidden shadow-lg"
        layout
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {state === "normal" && (
            <motion.div
              className="flex items-center justify-between px-5 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="normal"
            >
              <div className="flex items-center gap-4">
                <motion.span
                  className="w-2.5 h-2.5 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                ></motion.span>
                <span className="text-white text-xs font-medium">Online</span>
              </div>

              <div className="flex items-center gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={toggleMusic} className="text-white hover:text-zinc-300 transition-colors">
                        <Music className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Music player</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={toggleSettings} className="text-white hover:text-zinc-300 transition-colors">
                        {getNotificationModeIcon()}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notification settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>
          )}

          {state === "notification" && notification && (
            <motion.div
              className="flex items-center w-full px-5 py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="notification"
              layoutId="notification"
            >
              <Avatar className="h-10 w-10 mr-4">
                <AvatarImage src={notification.avatar} alt={notification.user} />
                <AvatarFallback>{notification.user.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{notification.user}</p>
                <div className="flex items-center gap-2 mt-1">
                  {getIcon()}
                  <p className="text-zinc-300 text-xs">{notification.content}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setState("normal")
                  if (onDismiss) onDismiss()
                }}
                className="text-zinc-400 hover:text-white transition-colors ml-4"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          )}

          {state === "settings" && (
            <motion.div
              className="flex flex-col w-full px-5 py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="settings"
              layoutId="settings"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-sm font-medium">Notifications</h3>
                <button onClick={() => setState("normal")} className="text-zinc-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-5">
                <div className="flex gap-3">
                  <motion.button
                    className={`p-1.5 rounded-full ${notificationMode === "all" ? "bg-zinc-700" : "bg-transparent"}`}
                    onClick={() => setNotificationMode("all")}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Volume2 className="h-5 w-5 text-white" />
                  </motion.button>
                  <motion.button
                    className={`p-1.5 rounded-full ${notificationMode === "mentions" ? "bg-zinc-700" : "bg-transparent"}`}
                    onClick={() => setNotificationMode("mentions")}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Volume1 className="h-5 w-5 text-white" />
                  </motion.button>
                  <motion.button
                    className={`p-1.5 rounded-full ${notificationMode === "none" ? "bg-zinc-700" : "bg-transparent"}`}
                    onClick={() => setNotificationMode("none")}
                    whileTap={{ scale: 0.9 }}
                  >
                    <VolumeX className="h-5 w-5 text-white" />
                  </motion.button>
                </div>
                <div className="text-xs text-zinc-300">
                  {notificationMode === "all"
                    ? "All notifications"
                    : notificationMode === "mentions"
                      ? "Mentions only"
                      : "Silent mode"}
                </div>
              </div>
            </motion.div>
          )}

          {state === "music" && (
            <motion.div
              className="flex items-center w-full px-5 py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="music"
              layoutId="music"
            >
              <div className="flex-1 flex items-center">
                <motion.div
                  className="w-12 h-12 bg-primary rounded-md mr-4 flex items-center justify-center"
                  animate={{ rotate: musicPlaying ? 360 : 0 }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Music className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <p className="text-white text-sm font-medium">{currentSong.title}</p>
                  <p className="text-zinc-300 text-xs mt-1">{currentSong.artist}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <motion.button
                  onClick={toggleMusic}
                  className="text-white hover:text-zinc-300 transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  {musicPlaying ? (
                    <span className="text-sm font-medium px-2">■</span>
                  ) : (
                    <span className="text-sm font-medium px-2">▶</span>
                  )}
                </motion.button>
                <button onClick={() => setState("normal")} className="text-zinc-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}

          {state === "network" && (
            <motion.div
              className="flex items-center w-full px-5 py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="network"
              layoutId="network"
            >
              <div className="flex-1 flex items-center">
                <motion.div
                  className={`w-12 h-12 rounded-md mr-4 flex items-center justify-center ${
                    networkStatus === "online" ? "bg-green-500" : "bg-red-500"
                  }`}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: 3 }}
                >
                  <Wifi className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {networkStatus === "online" ? "Connected" : "Disconnected"}
                  </p>
                  <p className="text-zinc-300 text-xs mt-1">
                    {networkStatus === "online" ? "Your connection is stable" : "Check your internet connection"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setState("normal")}
                className="text-zinc-400 hover:text-white transition-colors ml-4"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

